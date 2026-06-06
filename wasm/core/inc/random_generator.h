#pragma once
#include <random>
#include "../linalg/algorithms.h"

class IRandomGenerator {
public:
    IRandomGenerator() = default;
    virtual ~IRandomGenerator() = default;

    /// @brief Generate matrix of pseudo-random generated values
    virtual linalg::primitives::CMatrix<double> GenerateRandomSamples(size_t size) = 0;

    virtual void FullfillVectorWithRandoms(std::vector<double>& vec) = 0;
};

/// @brief Implementation of IRandomGenerator designed to be used in MonteCarlo sims
class CRandomGenerator : public IRandomGenerator {
private:
    std::mt19937 m_gen{std::random_device{}()};
    std::uniform_real_distribution<double> m_dist{0.0, 1.0};
public:
    CRandomGenerator(): IRandomGenerator() {};

    inline void SetSeed(double seed) {
        m_gen.seed(seed);
    };
    
    inline double GenerateRandom() {
        return m_dist(m_gen);
    };

    /// @brief Generate vector of pseudo-random samples generated with Gaussian distribution
    /// @param size number of vector columns
    /// @return CMatrix<double> filled with pseudo-random values
    inline linalg::primitives::CMatrix<double> GenerateRandomSamples(size_t size) {
        linalg::primitives::CMatrix<double> samples(size, 1);
        for (int i = 0; i < samples.rows(); i++) {
            samples[i][0] = linalg::algorithms::InverseNormal(GenerateRandom());
        }
        return samples;
    };

    void FullfillVectorWithRandoms(std::vector<double>& vec) {
        for (int i = 0; i < vec.size(); i++) {
            vec[i] = linalg::algorithms::InverseNormal(GenerateRandom());
        }
    };
};