#pragma once

#include "matrix_special.h"
#include "utils.h"
#include <cmath>
#include <numeric>
#include <array>
#include <set>
#include <vector>
#include <deque>

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
/// @return LowerTriangular matrix of type float
template<typename T>
CMatrixLowerTriangular<float> CholeskyFactorization(const CMatrix<T>& mat) {
    uint32_t n = mat.rows();
    uint32_t m = mat.cols();
    // cholesky factorization possible only for square matrices
    CHECK_EQUAL(n, m);
    // create output matrix
    CMatrixLowerTriangular<float> res(n, n);
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
float Mean(const T& cont) {
    float n = static_cast<float>(cont.size());
    if (n == 0.0) {
        // prevent dividing by 0
        return 0.0;
    }

    float sum = (std::accumulate(cont.begin(), cont.end(), 0.0, [](float acc, auto v) {
                    return acc + static_cast<float>(v);
                }));
    return sum / n;
};

/// @brief Count mean value for C style array
/// @tparam T type of array
/// @param buffer pointer to the array start
/// @param size size of the array
/// @return mean value of the array's elements up to size, as float
template<typename T>
float Mean(T* buffer, size_t size) {
    if (size <= 0) {
        return 0.0;
    }
    float sum = 0.0;
    for (size_t i = 0; i < size; i++, buffer++) {
        sum += (*buffer);
    }
    return sum / static_cast<float>(size);
};

};