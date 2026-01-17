#include "../inc/algorithms.h"

using namespace linalg::algorithms;

namespace linalg::algorithms {

    
double InverseNormal(double input) {
    static constexpr std::array<double, 4> inv_a = {2.50662823884,
                            -18.61500062529,
                            41.39119773534,
                            -25.44106049637};

    static constexpr std::array<double, 4> inv_b = {-8.47351093090,
                                23.08336743743,
                                -21.06224101826,
                                3.13082909833};

    static constexpr std::array<double, 9> inv_c = {0.3374754822726147,
                                0.9761690190917186,
                                0.1607979714918209,
                                0.0276438810333863,
                                0.0038405729373609,
                                0.0003951896511919,
                                0.0000321767881768,
                                0.0000002888167364,
                                0.0000003960315187};

    // input should be in range <0,1>
    CHECK_OUT_OF_RANGE(input, 1);
    CHECK_OUT_OF_RANGE(0, input);

    double r = 0, x = 0;
    double y = input - 0.5;
    if (std::abs(y) < 0.42) {
        // rational approximation
        r = y * y;
        x = y * (((inv_a[3] * r + inv_a[2]) * r + inv_a[1]) * r + inv_a[0]) / 
                        ((((inv_b[3] * r + inv_b[2]) * r + inv_b[1]) * r + inv_b[0]) * r + 1);
    }
    else {
        // Chebyshev approximation for tails
        r = input;
        if (y > 0) r = 1- input;
        r = std::log(-std::log(r));
        x = inv_c[0] + r * (inv_c[1] + r * 
                            (inv_c[2] + r * 
                            (inv_c[3] + r * 
                            (inv_c[4] + r * 
                            (inv_c[5] + r * 
                            (inv_c[6] + r * 
                            (inv_c[7] + r * 
                            inv_c[8])))))));
        if (y < 0) x = -x;
    }
    return x;
}

};