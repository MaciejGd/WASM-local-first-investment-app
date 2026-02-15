#pragma once
#include <iostream>
#include <vector>
#include <random>
#include "./matrix_special.h"
// jakich funkcji tutaj potrzebujemy???

// co należy robić
// 1) policzenie prerequisitów (to jest rzecz, którą należy liczyć tylko raz, cholesky etc.) 
// 2) losowanie wektora liczb pomiędzy 0 a 1
// 3) zamiana cen akcji w stopy zwrotów

namespace finance_api {

using namespace linalg::algorithms;
using namespace linalg::primitives;
using namespace linalg::utils;

// I guess we should encapsulate the logic in some kind of class to manage that
template<typename T>
class MonteCarloSimulator {
private:
    T* m_buffer;
    size_t m_stock_size;
    size_t m_stocks;

    CMatrixLowerTriangular<double> m_cholesky_decomposition;
protected:
    // pseudo-random generators
    std::mt19937 m_gen{std::random_device{}()};
    std::uniform_real_distribution<double> m_dist{0.0, 1.0};
public:
    MonteCarloSimulator(T* buffer, size_t chunk_size, size_t chunks_amount) {
        if (buffer == nullptr) {
            throw std::invalid_argument("Buffer passed as input argument is nullptr!");
        }
        if (chunk_size < 2) {
            throw std::invalid_argument("Chunk size of stock prices should be at least two to count returns!");
        }
        if (chunks_amount <= 0) {
            throw std::invalid_argument("Analyzed stock amounts should be at least one!");
        }
        m_buffer = buffer;
        m_stock_size = chunk_size;
        m_stocks = chunks_amount;

        
    };

    void Simulate(int32_t time, int32_t simulations_amount) {
        // here we need to accomplish a few things:
        // run two for loops, outer one, for number of simulations, inner one, for number of analyzed days.
        // for each day we want to analyze pseudo random sample
    }

protected:
    /// Generate pseudo-random double from the range 0 to 1
    double m_GenerateRandom() {
        // static as these should be initialized once at first use
        return m_dist(m_gen);
    }

    CMatrix<double> m_GenerateRandomSamples() {
        CMatrix<double> samples(m_stocks, 1);
        for (int i = 0; i < samples.rows(); i++) {
            samples[i][0] = InverseNormal(m_GenerateRandom());
        }

        return samples;
    }
    
    std::vector<std::vector<double>> m_TransformPriceToReturns() {
        // each chunk of returns should be of size - 1
        std::vector<std::vector<double>> result(m_stocks, std::vector<double>(m_stock_size - 1));
        for (int i = 0; i < result.size(); i++) {
            int start = i * m_stock_size;
            // check each chunk
            double prev = static_cast<double>(m_buffer[start]);
            for (int j = 0; j < result[i].size(); j++) {
                double current = m_buffer[start + j + 1];
                if (current == 0) {
                    throw std::logic_error("Stock price provided cannot be equal to zero!!!");
                }
                result[i][j] = (current - prev) / prev;
                prev = current;
            }
        }
        return result;
    }
};



} // end of finance_api namespace

//void PrepareData();




