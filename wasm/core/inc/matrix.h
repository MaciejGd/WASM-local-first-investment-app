#pragma once

#include <stdint.h>
#include <vector>
#include <iostream>
#include <stdexcept>
#include <utility>

#include "utils.h"

namespace linalg::primitives {

/// @brief Main purpose of the class is to let us introduce the out_of_range checking on Matrix rows
/// @tparam T inner type of Matrix row
template<typename T>
class MatrixRowProxy {
    T* m_data = nullptr;
    uint32_t m_cols = 0;
public:
    MatrixRowProxy(T* data, uint32_t cols): m_data(data), m_cols(cols) {}

    /// @brief Access element form the Matrix row
    /// @param idx index of element that should be accessed
    /// @return value of the element from the matrix
    T& operator[](uint32_t idx) {
        CHECK_OUT_OF_RANGE(idx, m_cols - 1);
        return m_data[idx];
    }
};


// we actually need mosty matrix, as vector is just a matrix of 1 x n
template <typename T>
class CMatrix {    
    using matrix_container = std::vector<T>;
public:
    /// @brief Initialize matrix with zeros
    /// @param rows number of matrix rows 
    /// @param cols number of matrix cols
    CMatrix(const uint32_t& rows, const uint32_t& cols): m_rows(rows), m_cols(cols) {
        // zero initialize matrix
        m_mat = matrix_container(m_rows * m_cols, T{});
    };

    /// @brief Initialize CMatrix from 2D vector
    /// @param mat 2D vector with initial values
    CMatrix(const vector<vector<T>>& mat) {
        // throw expection if empty container passed
        if (mat.size() == 0) {
            throw std::invalid_argument("Matrix cannot be constructed from empty data");
        }

        size_t prev_row = mat[0].size();
        for (int i = 0; i < mat.size(); i++) {
            if (prev_row != mat[i].size()) {
                throw std::invalid_argument("All rows of the Matrix should be the same length");
            }
        }
        m_rows = mat.size();
        m_cols = mat[0].size();
        m_mat = matrix_container(m_rows * m_cols, T{});
        // fill values from 2D vector into a inner container
        for (int i = 0; i < m_rows; i++) {
            for (int j = 0; j < m_cols; j++) {
                m_mat[i*m_cols + j] = mat[i][j];
            }
        }
    }

    CMatrix(const std::vector<T>& vec): m_rows(1), m_cols(vec.size()) {
        if (vec.size() == 0) {
            throw std::invalid_argument("Matrix cannot be constructed from empty data");
        }
        m_mat = vec;
    }

    CMatrix(const CMatrix& other) = default;
    CMatrix(CMatrix&& other) = default;
    CMatrix& operator=(const CMatrix& other) = default;
    CMatrix& operator=(CMatrix&& other) = default;
    virtual ~CMatrix() = default;

    /// @brief Operator for matrix multiplication
    /// @tparam N undderlaying type of matrix
    /// @param other second matrix for multiplication
    /// @return CMatrix resulting from multiplication
    template<typename N>
    auto operator*(const CMatrix<N>& other) {
        // output type for multiplying ex. float and int
        using O = decltype(std::declval<T>() * std::declval<N>());
        // handle not correct dimensions of matrix
        CHECK_VALUES_EQUAL(m_cols, other.rows());
        // create output matrix
        const uint32_t n = m_rows;
        const uint32_t m = other.cols();
        const uint32_t t = m_cols;
        CMatrix<O> ret(n, m);
        for (uint32_t i = 0; i < n; i++) {
            for (uint32_t j = 0; j < m; j++) {
                O value{};
                for (uint32_t k = 0; k < t; k++) {
                    value += (at(i,k) * other.at(k,j));
                }
                ret[i][j] = value;
            }
        }
        return ret;
    }

    /// @brief Matrix addition operator
    /// @tparam N type of the matrix to be added
    /// @param other matrix to be added
    /// @return new matrix resulting from addition
    template<typename N>
    auto operator+(const CMatrix<N>& other) {
        using O = decltype(std::declval<T>() * std::declval<N>());
        // for addition both rows and cols should be the same
        CHECK_VALUES_EQUAL(m_rows, other.rows());
        CHECK_VALUES_EQUAL(m_cols, other.cols());
        const uint32_t n = m_rows;
        const uint32_t m = other.cols();
        CMatrix<O> ret(n, m);
        for (uint32_t i = 0; i < n; i++) {
            for (uint32_t j = 0; j < m; j++) {
                ret[i][j] = at(i,j) + other.at(i,j);
            }
        }
        return ret;
    }

    /// @brief Matrix substraction operator
    /// @tparam N type of the matrix to be substracted
    /// @param other matrix to be substracted
    /// @return new matrix resulting from substraction
    template<typename N>
    auto operator-(const CMatrix<N>& other) {
        using O = decltype(std::declval<T>() * std::declval<N>());
        // for addition both rows and cols should be the same
        CHECK_VALUES_EQUAL(m_rows, other.rows());
        CHECK_VALUES_EQUAL(m_cols, other.cols());
        const uint32_t n = m_rows;
        const uint32_t m = other.cols();
        CMatrix<O> ret(n, m);
        for (uint32_t i = 0; i < n; i++) {
            for (uint32_t j = 0; j < m; j++) {
                ret[i][j] = at(i,j) - other.at(i,j);
            }
        }
        return ret;
    }

    /// @brief Return reference to the row of matrix
    /// @param idx number of row to be returned
    /// @return reference to the matrix row
    MatrixRowProxy<T> operator[](uint32_t idx) {
        CHECK_OUT_OF_RANGE(idx, m_rows - 1);
        return MatrixRowProxy<T>(&m_mat[idx * m_cols], m_cols);
    }

    /// @brief Constant getter of matrix value
    /// @param y row index
    /// @param x col index
    /// @return value at (y,x) coordinates
    const T& at(uint32_t y, uint32_t x) const {
        CHECK_OUT_OF_RANGE(y, m_rows-1);
        CHECK_OUT_OF_RANGE(x, m_cols-1);
        return m_mat[y * m_cols + x];
    }

    /// @brief Getter for number of matrix columns
    /// @return number of matrix columns
    constexpr uint32_t cols() const noexcept {
        return m_cols;
    }

    /// @brief Getter for number of matrix rows
    /// @return number of matrix rows
    constexpr uint32_t rows() const noexcept {
        return m_rows;
    }

    /// @brief Transposing matrix. This is done in place, modifying underlaying mat container
    void Transpose() {
        matrix_container cont(m_cols, std::vector<T>(m_rows, T{}));
        for (int32_t i = 0; i < m_rows; i++) {
            for (uint32_t j = 0; j < m_cols; j++) {
                cont[j][i] = std::move(m_mat[i][j]);
            }
        }
        // update properties
        m_mat = std::move(cont);
        m_rows = m_mat.size();
        m_cols = m_mat[0].size();
    };
protected:
    /// number of rows in a matrix 
    uint32_t m_rows;
    /// number of cols in a matrix
    uint32_t m_cols;
    /// underlying matrix container
    matrix_container m_mat;
};

template<typename T, typename N>
auto operator*(const CMatrix<T>& mat, const N& scalar) 
    noexcept(noexcept(std::declval<T>() * std::declval<N>()))
{
    using O = decltype(std::declval<T>() * std::declval<N>());
    // create new matrix and multiply by scalar
    uint32_t n = mat.rows();
    uint32_t m = mat.cols();
    CMatrix<O> res(n, m);
    for (uint32_t i = 0; i < n; i++) {
        for (uint32_t j = 0; j < m; j++) {
            res[i][j] = mat.at(i,j) * scalar;
        }
    }
    return res;
}

template<typename T, typename N>
auto operator*(const N& scalar, const CMatrix<T>& mat) 
    noexcept(noexcept(std::declval<T>() * std::declval<N>()))
{
    return mat * scalar;
}

}