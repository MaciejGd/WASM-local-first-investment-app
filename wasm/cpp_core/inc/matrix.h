#pragma once

#include <stdint.h>
#include <vector>
#include <iostream>

// we actually need mosty matrix, as vector is just a matrix of 1 x n
template <typename T>
class Matrix {
    using container = std::vector<std::vector<T>>;
public:
    Matrix(const uint32_t& rows, const uint32_t& cols): m_rows(rows), m_cols(cols) {
        // zero initialize matrix
        m_mat = std::vector<std::vector<T>>(m_rows, std::vector<T>(m_cols, T{}));
    };

    Matrix(const container& mat): m_mat(mat) {
        m_rows = m_mat.size();
        m_cols = m_mat[0].size();
    }

    template<typename N>
    Matrix<decltype(T{} * N{})> operator*(const Matrix<N>& other) {
        const uint32_t n = m_rows;
        const uint32_t m = other.cols();
        std::cout << "Rows: " << m_rows << " cols: " << other.cols() << std::endl;
        Matrix<decltype(T{} * N{})> ret(n, m); // proper casting needed so we can multiply two matrixes



        return ret;
    }

    Matrix operator*(const Matrix<T>& other) {
        std::cout << "Same type\n";
        return Matrix<T>(1,2);
    }

    

    // getters for mat properties
    constexpr uint32_t cols() const {
        return m_cols;
    }

    constexpr uint32_t rows() const {
        return m_rows;
    }
private:
    uint32_t m_rows;
    uint32_t m_cols;
    std::vector<std::vector<T>> m_mat;

    template<typename N, typename M> 
    void m_multiply(const Matrix<N>& first, const Matrix<M>& second) {
        // TODO consider changing with Strassen algorithm
        uint32_t n = out.rows();
        uint32_t m = out.cols();
        uint32_t t = first.cols();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                K value{};
                for (int k = 0; k < t; k++) {
                    value += (first[i][k] * second[k][j]); // this needs a refactor
                }
                this.m_mat[i][j] = value;
            }
        }
    };
};