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

UNIT_TEST(MatrixAlgorithms, CholeskyNotSymmetricMatrix) {
    using namespace linalg::algorithms;

    std::vector<std::vector<int>> mat = {
                            {2, 2, 2}, 
                            {3, 1,  2},
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

    std::vector<std::vector<double>> expected_output = {
                                        {2.4494897427831779, 0, 0},
                                        {0.81649658092772615, 2.0816659994661326, 0},
                                        {0.40824829046386307, 0.80064076902543568, 1.7867030229749128}
                                    };
    CMatrix expected_mat(expected_output);                                            
    CMatrix matrix = CMatrix(mat);
    auto ret = CholeskyFactorization(matrix);
    CHECK_EQUAL(expected_mat, ret);                     
}

