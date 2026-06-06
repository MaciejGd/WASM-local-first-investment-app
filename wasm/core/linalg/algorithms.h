#pragma once

#include "matrix_special.h"
#include <cmath>
#include <numeric>
#include <array>
#include <set>
#include <vector>
#include <deque>

#include <span>

namespace linalg::algorithms {
using namespace linalg::primitives;

/// @brief Count Cholesky factorization for Symmetric positive define, matrix
/// @tparam T underlying type for input matrix 
/// @param mat input matrix
/// @return LowerTriangular matrix of type double
template<typename T>
CMatrixLowerTriangular<double> CholeskyFactorization(const CMatrix<T>& mat) {
    uint32_t n = mat.rows();
    uint32_t m = mat.cols();
    // check if analyzed matrix is symmetric
    if (!mat.IsSymmetric()) {
        throw std::logic_error("Matrix for Cholesky Factorization needs to be symmetric");
    }
    // we should also reject matrixes that are not symmetric and not positive defined
    // create output matrix
    CMatrixLowerTriangular<double> res(n, n);
    for (int32_t i = 0; i < (int32_t)n; i++) {
        for (int32_t j = 0; j <= i; j++) {
            auto& cell = res[i][j];
            for (int32_t k = 0; k <= j -1; k++) {
                cell += (res.at(i,k) * res.at(j, k));
            }
            cell = mat.at(i, j) - cell;
            if (i == j) {              
                // we will get the sqrt of cell, if the value is negative we can say that matrix is not pisitive definitness
                if (cell < 0) {
                    throw std::logic_error("Failed to perform CholeskyFactorization, matrix is not positive definite!");
                }  
                cell = std::sqrt(cell);
                continue;
            }
            cell /= res.at(j, j);
        }
    }
    return res;
};

template<typename T>
struct is_stl_container {
    static const bool value = false;
};

template<typename T, typename A>
struct is_stl_container<std::vector<T, A>> {
    static const bool value = true;
};

template<typename T, typename S, typename A>
struct is_stl_container<std::set<T, S, A>> {
    static const bool value = true;
};

template<typename T, std::size_t N>
struct is_stl_container<std::array<T, N>> {
    static const bool value = true;
};

template<typename T, typename A>
struct is_stl_container<std::deque<T, A>> {
    static const bool value = true;
};

/// @brief Count mean value for STL container
/// @tparam T type representing container, vector, array, set and deque are possible
/// @tparam make use of SFINAE  
/// @param cont container
/// @return mean value of the container's elements as float
template<typename T, 
        typename = typename std::enable_if<is_stl_container<T>::value>::type >
double Mean(const T& cont) {
    double n = static_cast<double>(cont.size());
    if (n == 0.0) {
        // prevent dividing by 0
        return 0.0;
    }

    double sum = (std::accumulate(cont.begin(), cont.end(), 0.0, [](double acc, auto v) {
                    return acc + static_cast<double>(v);
                }));
    return sum / n;
};

/// @brief Count mean value for C style array
/// @tparam T type of array
/// @param buffer pointer to the array start
/// @param size size of the array
/// @return mean value of the array's elements up to size, as float
template<typename T>
double Mean(T* buffer, size_t size) {
    // validate input buffer address
    if (!buffer) {
        throw std::invalid_argument("Provided buffer is nullptr");
    }

    if (size <= 0) {
        return 0.0;
    }
    double sum = 0.0;
    for (size_t i = 0; i < size; i++, buffer++) {
        sum += (*buffer);
    }
    return sum / static_cast<double>(size);
};

/// @brief Represent mean values as Matrix (vector with chunks_size rows and one column)
/// @tparam T type of input values
/// @param buffer input array consisting of chunks_amount chunks of data placed
/// one after another
/// @param chunk_size size of single chunk
/// @param chunks_amount amount of chunks for which mean values should be counted
/// @return Matrix of dimensions: chunks_amount x 1
template<typename T>
std::vector<double> GetMeanVector(T* buffer, size_t chunks_amount, size_t chunk_size) {
    std::vector<double> res(chunks_amount, 0);
    // iterate through chunks and count mean value for each
    for (size_t i = 0; i < chunks_amount; i++, buffer += chunk_size) {
        res[i] = Mean(buffer, chunk_size);
    }
    return res;
};

/// @brief Function producing covariance matrix from input data in form of C-style array
/// @tparam T underlying type of input buffer 
/// @param buffer array consisting data
/// @param chunk_size size of each data chunk
/// @param chunks_amount amount of data chunks stored in buffer
/// @return Covariance matrix
template<typename T>
CMatrix<double> GetCovarianceMatrix(T* buffer, const size_t& chunks_amount, const size_t& chunk_size) {
    if (!buffer) {
        throw std::invalid_argument("Input buffer is nullptr!");
    }
    // vector for variance values
    std::vector<double> means(chunks_amount);
    T* head = buffer;
    for (size_t i = 0; i < chunks_amount; i++, head += chunk_size) {
        means[i] = Mean(head, chunk_size);
    }
    head = buffer; // bring buffer pointer back to the first element
    CMatrix<double> res(chunks_amount, chunks_amount);
    for (size_t i = 0; i < chunks_amount; i++) {
        // count half of the output matrix
        for (size_t j = i; j < chunks_amount; j++) {
            auto& cell = res[i][j];
            size_t i_start = (i * chunk_size);
            size_t j_start = (j * chunk_size);
            for (size_t k = 0; k < chunk_size; k++)
            {
                double val1 = (static_cast<double>(head[i_start + k]) - means[i]);
                double val2 = (static_cast<double>(head[j_start + k]) - means[j]);
                cell += (val1 * val2);
            }
            cell /= (chunk_size - 1);            
        }
    }
    // fill in second half of cov matrix, as it is symmetric
    for (int i = 1; i < chunks_amount; i++) {
        for (int j = 0; j < i; j++) {
            res[i][j] = res.at(j,i);
        }
    }

    return res;
};

/// @brief Perform Hadamard product over two matrices
/// @tparam T type of the first matrix
/// @tparam N type of the second matrix
/// @param a first matrix to be multiplied
/// @param b second matrix to be multiplied
/// @return new matrix created after applying Hadamard product
template<typename T, typename N>
auto HadamardProduct(const CMatrix<T>& a, const CMatrix<N>& b) {
    using O = decltype(std::declval<T>() * std::declval<N>());
    CHECK_VALUES_EQUAL(a.rows(), b.rows());
    CHECK_VALUES_EQUAL(a.cols(), b.cols());
    // perform HadamardProduct of two matrices
    CMatrix<O> mat(a.rows(), a.cols());
    for (int i = 0; i < a.rows(); i++) {
        for (int j = 0; j < a.cols(); j++) {
            mat[i][j] = a.at(i,j) * b.at(i,j);
        }
    }
    return mat;
}

/// Inverse normal distribution using Beasley-Springer-Moro algorithm.
/// Algorithm trades a little bit of accuracy for the speed. Error produced is typically 
/// about 1e-10 which is sufficient for financial engineering.
/// @param input random variable from range (0,1)
/// @return random variable distributed with normal matter
double InverseNormal(double input);
};