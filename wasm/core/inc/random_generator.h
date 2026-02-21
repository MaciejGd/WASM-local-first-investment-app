#pragma once
#include <random>


class IRandomGenerator {
public:
    IRandomGenerator() = default;
    virtual ~IRandomGenerator() = default;

    /// @brief Generate random number
    /// @return double value
    virtual double GenerateRandom() = 0;
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
    
    inline double GenerateRandom() override {
        return m_dist(m_gen);
    };
};