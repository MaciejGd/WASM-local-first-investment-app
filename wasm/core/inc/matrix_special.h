#pragma once
#include "matrix.h"

namespace linalg::primitives {

using namespace linalg::primitives;

/// @brief Special implementation of Matrix, let us initialize Diagonal matrix
/// @tparam T 
template<typename T>
class CMatrixDiagonal : public CMatrix<T> {
public:
    CMatrixDiagonal(uint32_t rows, uint32_t cols, int32_t value): CMatrix<T>(rows, cols) {
        uint32_t diag_length = std::min(cols, rows);
        for (uint32_t i = 0; i < diag_length; i++) {
            this->m_mat[i * this->m_cols + i] = value;
        }
    }

    CMatrixDiagonal(): CMatrix<T>() {};

    template<typename N>
    auto operator*(const CMatrix<N>& other) {
        using O = decltype(std::declval<T>() * std::declval<N>());
        CHECK_VALUES_EQUAL(this->m_cols, other.rows());
        // create output matrix
        const uint32_t n = this->m_rows;
        const uint32_t m = other.cols();
        const uint32_t t = this->m_cols;
        CMatrix<O> ret(n, m);

        for (uint32_t i = 0; i < n; i++) {
            for (uint32_t j = 0; j < m; j++) {
                O value = (this->at(i,i) * other.at(i,j));
                ret[i][j] = value;
            }
        }
        return ret;
    }
};

template<typename T> 
class CMatrixUpperTriangle : public CMatrix<T> {
    using matrix_container = std::vector<std::vector<T>>;
public:
    CMatrixUpperTriangle(uint32_t n, uint32_t m): CMatrix<T>(n, m) {};

    CMatrixUpperTriangle(): CMatrix<T>() {};
    
    CMatrixUpperTriangle(matrix_container& mat): CMatrix<T>(mat) {
        // fill everything above diagonal with zeros
        for (uint32_t i = 0; i < this->m_rows; i++) {
            uint32_t range = std::min(this->m_cols, i);
            for (uint32_t j = 0; j < range; j++) {
                this->m_mat[i * this->m_cols + j] = 0;
            }
        }
    };

    template<typename N>
    auto operator*(const CMatrix<N>& other) {
        using O = decltype(std::declval<T>() * std::declval<N>());
        CHECK_VALUES_EQUAL(this->m_cols, other.rows());
        // create output matrix
        const uint32_t n = this->m_rows;
        const uint32_t m = other.cols();
        const uint32_t t = this->m_cols;
        CMatrix<O> ret(n, m);

        for (uint32_t i = 0; i < n; i++) {
            for (uint32_t j = 0; j < m; j++) {
                O value{};
                // here little change but means a lot. we iterate until min(i, t),
                // so in case of square matrix we skip almost half of multiply addition operations!
                for (uint32_t k = i; k < t; k++) {
                    value += (this->at(i,k) * other.at(k,j));
                }
                ret[i][j] = value;
            }
        }
        return ret;
    }
};

template<typename T> 
class CMatrixLowerTriangular : public CMatrix<T> {
    using matrix_container = std::vector<std::vector<T>>;
public: 
    CMatrixLowerTriangular(uint32_t n, uint32_t m): CMatrix<T>(n, m) {};

    CMatrixLowerTriangular(): CMatrix<T>() {};

    CMatrixLowerTriangular(matrix_container& mat): CMatrix<T>(mat) {
        // fill everything above diagonal with zeros
        for (uint32_t i = 0; i < this->m_rows; i++) {
            for (uint32_t j = i + 1; j < this->m_cols; j++) {
                this->m_mat[i * this->m_cols + j] = 0;
            }
        }
    };

    bool operator==(const CMatrix<T>& other) {
        return false;
    }

    CMatrixLowerTriangular(const std::vector<T>& vec): CMatrix<T>(vec) {};

    template<typename N>
    auto operator*(const CMatrix<N>& other) {
        using O = decltype(std::declval<T>() * std::declval<N>());
        CHECK_VALUES_EQUAL(this->m_cols, other.rows());
        // create output matrix
        const uint32_t n = this->m_rows;
        const uint32_t m = other.cols();
        const uint32_t t = this->m_cols;
        CMatrix<O> ret(n, m);

        for (uint32_t i = 0; i < n; i++) {
            for (uint32_t j = 0; j < m; j++) {
                O value{};
                // here little change but means a lot. we iterate until min(i, t),
                // so in case of square matrix we skip almost half of multiply addition operations!
                uint32_t range = std::min(t-1, i);
                for (uint32_t k = 0; k <= range; k++) {
                    value += (this->at(i,k) * other.at(k,j));
                }
                ret[i][j] = value;
            }
        }
        return ret;
    }
};

}