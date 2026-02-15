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

UNIT_TEST(MatrixAlgorithms, CholeskyNotPositiveMatrix) {
    using namespace linalg::algorithms;

    std::vector<std::vector<int>> mat = {
                            {1, 2, 0}, 
                            {2, -1, 0},
                            {0, 0, 3}};


    CMatrix matrix = CMatrix(mat);
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

UNIT_TEST(MeanTestsContainers, VectorTest) {
    using namespace linalg::algorithms;

    std::vector<int> vec = {1, 2, 3, 4};
    double expected_mean = 2.5;
    CHECK_EQUAL_FLOAT(Mean(vec), expected_mean);
}

UNIT_TEST(MeanTestsContainers, ArrayTest) {
    using namespace linalg::algorithms;

    std::array<int, 4> arr = {1, 2, 3, 4};
    double expected_mean = 2.5;
    CHECK_EQUAL_FLOAT(Mean(arr), expected_mean);
}

UNIT_TEST(MeanTestsContainers, DequeTest) {
    using namespace linalg::algorithms;

    std::deque<int> arr = {1, 2, 3, 4};
    double expected_mean = 2.5;
    CHECK_EQUAL_FLOAT(Mean(arr), expected_mean);
}

UNIT_TEST(MeanTestsContainers, SetTest) {
    using namespace linalg::algorithms;

    std::set<int> arr = {1, 2, 3, 4};
    double expected_mean = 2.5;
    CHECK_EQUAL_FLOAT(Mean(arr), expected_mean);
}

UNIT_TEST(MeanTestsContainers, EmptyCont) {
    using namespace linalg::algorithms;

    std::vector<int> vec;
    CHECK_EQUAL_FLOAT(Mean(vec), 0.0);
}

UNIT_TEST(MeanTestsCBuffers, MeanTest) {
    using namespace linalg::algorithms;

    int arr[] = {1, 2, 3, 4};
    size_t size = 4;
    CHECK_EQUAL_FLOAT(Mean(arr, size), 2.5);
}

UNIT_TEST(MeanTestsCBuffers, MeanTestZeroSize) {
    using namespace linalg::algorithms;
    
    int arr[] = {1, 2, 3, 4};
    size_t size = 0;
    CHECK_EQUAL_FLOAT(Mean(arr, size), 0);
}

UNIT_TEST(MeanTestsCBuffers, MeanTestNullptr) {
    using namespace linalg::algorithms;
    
    int* arr = nullptr;
    size_t size = 5;
    CHECK_THROW(auto ret = Mean(arr, size), std::invalid_argument);
}

UNIT_TEST(GetMeanMatrix, CorrectMeanReturns) {
    using namespace linalg::algorithms;
    using namespace linalg::primitives;
    // let set 3 chunks, 4 elements each
    int arr[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    size_t chunks_size = 4;
    size_t chunks_amount = 3;
    
    vector<vector<double>> expected_mat = {{2.5},
                                    {6.5},
                                    {10.5}
                                };
    auto expected_matrix = CMatrix(expected_mat);
    auto result_matrix = GetMeanMatrix(arr, chunks_size, chunks_amount);
    CHECK_EQUAL(expected_matrix, result_matrix);
}

UNIT_TEST(GetCovarianceMatrix, NullptrBuffer) {
    using namespace linalg::algorithms;
    using namespace linalg::primitives;

    int* buf = nullptr;
    size_t chunk_size = 5;
    size_t chunks_amount = 5;


    CHECK_THROW(GetCovarianceMatrix(buf, chunk_size, chunks_amount), std::invalid_argument);
}

UNIT_TEST(GetCovarianceMatrix, GetCovariance) {
    using namespace linalg::algorithms;
    int test[] = {
                1,  2,  3,  4,  5,
                2,  1,  2,  3,  4,
                3,  4,  2,  1,  3,
                5,  3,  4,  2,  1
                };
    auto res = GetCovarianceMatrix(test, 5, 4);

    CMatrix<double> expected_output = CMatrix<double>({{2.5, 1.5, -0.75, -2.25},
                                                        {1.5, 1.3,  -0.55, -1.25},
                                                        {-0.75, -0.55, 1.3, 0.25},
                                                        {-2.25, -1.25, 0.25, 2.5}});

    CHECK_EQUAL(res, expected_output);
}

UNIT_TEST(InverseNormal, InputBelowRange) {
    using namespace linalg::algorithms;

    double test = -0.1;

    CHECK_THROW(InverseNormal(test), std::out_of_range);
}

UNIT_TEST(InverseNormal, InputAboveRange) {
    using namespace linalg::algorithms;

    double test = 1.1;

    CHECK_THROW(InverseNormal(test), std::out_of_range);
}

UNIT_TEST(InverseNormal, InverseNormal) {
    using namespace linalg::algorithms;

    double test = 1.1;

    std::array<double, 5> inputs = {0.01,
                                    0.25,
                                    0.5,
                                    0.75,
                                    0.99};                                
    std::array<double, 5> expected_outputs{-2.3263478740408408,
                                            -0.6744897501960817,
                                            0.0,
                                            0.6744897501960817,
                                            2.3263478740408408};


    for (int i = 0; i < 5; i++) {
        double ret = InverseNormal(inputs[i]);
        CHECK_EQUAL_FLOAT(ret, expected_outputs[i]);
    }
}