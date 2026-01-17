#pragma once

#include "matrix_special.h"
#include "utils.h"
#include <cmath>
#include <numeric>
#include <array>
#include <set>
#include <vector>
#include <deque>

#include <span>

namespace linalg::algorithms {

//algorithms in particular that are needed 
// 1_) Cholesky factorization
// 2_) Counting means values
// 3_) Couting covariance
// 4_) Generate Random numbers based on normal distribution
using namespace linalg::primitives;

/// @brief Count Cholesky factorization for Symmetric positive define, matrix
/// @tparam T underlying type for input matrix 
/// @param mat input matrix
/// @return LowerTriangular matrix of type double
template<typename T>
CMatrixLowerTriangular<double> CholeskyFactorization(const CMatrix<T>& mat) {
    uint32_t n = mat.rows();
    uint32_t m = mat.cols();
    // cholesky factorization possible only for square matrices
    CHECK_VALUES_EQUAL(n, m);
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
        typename = std::enable_if<is_stl_container<T>::value>::type >
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
    if (size <= 0) {
        return 0.0;
    }
    double sum = 0.0;
    for (size_t i = 0; i < size; i++, buffer++) {
        sum += (*buffer);
    }
    return sum / static_cast<double>(size);
};

/// @brief Represent mean values as Matrix
/// @tparam T type of input values
/// @param buffer array with input values
/// @param chunk_size size of single chunk
/// @param chunks_amount amount of chunks for which mean values should be counted
/// @return Matrix of dimensions: chunks_amount x 1
template<typename T>
CMatrix<double> GetMeanMatrix(T* buffer, size_t chunk_size, size_t chunks_amount) {
    CMatrix<double> res(chunks_amount, 1);
    // iterate through chunks and count mean value for each
    for (size_t i = 0; i < chunks_amount; i++, buffer += chunk_size) {
        res[i][0] = Mean(buffer, chunk_size);
    }
    return res;
};

// TODO resulting matrix is symmetric, amount of computations can be strongly reduced
template<typename T>
CMatrix<double> GetCovarianceMatrix(T* buffer, size_t chunk_size, const size_t& chunks_amount) {
    // vector for variance values
    std::vector<double> means(chunks_amount);
    T* head = buffer;
    for (size_t i = 0; i < chunks_amount; i++, buffer += chunk_size) {
        means[i] = Mean(buffer, chunk_size);
    }
    buffer = head; // bring buffer pointer back to the first element
    CMatrix<double> res(chunks_amount, chunks_amount);
    for (size_t i = 0; i < chunks_amount; i++) {
        for (size_t j = 0; j < chunks_amount; j++) {
            auto& cell = res[i][j];
            size_t i_start = (i * chunk_size);
            size_t j_start = (j * chunk_size);
            for (size_t k = 0; k < chunk_size; k++)
            {
                T val1 = (buffer[i_start + k] - means[i]);
                T val2 = (buffer[j_start + k] - means[j]);
                cell += (val1 * val2);
            }
            cell /= (chunk_size - 1);            
        }
    }

    return res;
};

/// @brief Inverse normal distribution using Beasley-Springer-Moro  algorithm
/// @param input random variable from range (0,1)
/// @return random variable distributed with normal matter
double InverseNormal(double input);


};









