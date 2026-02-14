#pragma once 
#include "../test_source/tests_runner.h"
#include "../../core/inc/algorithms.h"



UNIT_TEST(MatrixAlgorithms, CholeskyNotProperDimensions) {
    using namespace linalg::algorithms;

    std::vector<std::vector<int>> mat = {{1, 2, 3},
                            {2, 2, 2}, 
                            {3, 1, 2},
                            {3, 1, 2}};

    CMatrix matrix = CMatrix(mat);
    // to perform Cholesky factorization, matrix need to be a square
    CHECK_THROW(auto ret = CholeskyFactorization(matrix), std::logic_error);   
}

UNIT_TEST(MatrixAlgorithms, CholeskyFactorization) {
    using namespace linalg::algorithms;

    std::vector<std::vector<int>> mat = {
                            {6, 2, 1}, 
                            {2, 5, 2},
                            {1, 2, 4}};

    CMatrix matrix = CMatrix(mat);
}