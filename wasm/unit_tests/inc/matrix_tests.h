#pragma once
#include "../../core/inc/matrix.h"
#include "../test_source/tests_runner.h"

/// INITIALIZATIONS TESTS
UNIT_TEST(MatrixInitialization, EmptyInitialization) {
    using namespace linalg::primitives;

    CHECK_NO_THROW(CMatrix<int> mat(1,2));
}

UNIT_TEST(MatrixInitialization, InitializeFrom2DVector) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat = {{1,2},{3,4}};
    CHECK_NO_THROW(auto matrix = CMatrix(mat));
}

UNIT_TEST(MatrixInitialization, InitializeFromVector) {
    using namespace linalg::primitives;
    using namespace std;

    vector<int> vec = {1,2,3,4};
    CHECK_NO_THROW(auto matrix = CMatrix(vec));
}

UNIT_TEST(MatrixInitialization, EmptyInitialization2DVector) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat = {};
    CHECK_THROW(auto matrix = CMatrix(mat), std::invalid_argument);
}

UNIT_TEST(MatrixInitialization, NotEqualCols2DVectorInit) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat = {{1,2,3}, {1,2}, {1,2,3}};
    CHECK_THROW(auto matrix = CMatrix(mat), std::invalid_argument);
}

UNIT_TEST(MatrixInitialization, EmptyInitializationVector) {
    using namespace linalg::primitives;
    using namespace std;

    vector<float> vec;
    CHECK_THROW(auto matrix = CMatrix(vec), std::invalid_argument);
}

/// MATRIX DIMENSIONS TESTS
UNIT_TEST(MatrixDimensions, EmptyInitializationDimensions) {
    using namespace linalg::primitives;

    size_t n = 3;
    size_t m = 4;

    CMatrix<float> mat(n, m);
    CHECK_EQUAL(mat.rows(), n);
    CHECK_EQUAL(mat.cols(), m);
}

UNIT_TEST(MatrixDimensions, Vector2DDimensions) {
    using namespace linalg::primitives;
    using namespace std;

    size_t n = 3;
    size_t m = 4;
    vector<vector<float>> vec(n, vector<float>(m, 0));

    CMatrix<float> mat(vec);
    CHECK_EQUAL(mat.rows(), n);
    CHECK_EQUAL(mat.cols(), m);
}

UNIT_TEST(MatrixDimensions, VectorDimensions) {
    using namespace linalg::primitives;
    using namespace std;

    size_t n = 4;
    vector<float> vec(n, 0);

    CMatrix<float> mat(vec);
    CHECK_EQUAL(mat.rows(), 1);
    CHECK_EQUAL(mat.cols(), n);
}

/// MATRIX VALUES CHECKING
UNIT_TEST(MatrixValuesAccess, refAccessVector) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    auto matrix = CMatrix(mat);
    // assigning matrix[][] to a value in tests as vectors[] operator is marked as nodiscard
    float value = 0;
    CHECK_EQUAL(value = matrix[0][0], 1); 
    CHECK_EQUAL(value = matrix[0][1], 2);
    CHECK_EQUAL(value = matrix[0][2], 3);
    CHECK_EQUAL(value = matrix[1][0], 4); 
    CHECK_EQUAL(value = matrix[1][1], 5);
    CHECK_EQUAL(value = matrix[1][2], 6);
    CHECK_EQUAL(value = matrix[2][0], 7); 
    CHECK_EQUAL(value = matrix[2][1], 8);
    CHECK_EQUAL(value = matrix[2][2], 9);
}

UNIT_TEST(MatrixValuesAccess, ConstantAccess2DVector) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    auto matrix = CMatrix(mat);
    CHECK_EQUAL(matrix.at(0, 0), 1); 
    CHECK_EQUAL(matrix.at(0, 1), 2);
    CHECK_EQUAL(matrix.at(0, 2), 3);
    CHECK_EQUAL(matrix.at(1, 0), 4); 
    CHECK_EQUAL(matrix.at(1, 1), 5);
    CHECK_EQUAL(matrix.at(1, 2), 6);
    CHECK_EQUAL(matrix.at(2, 0), 7); 
    CHECK_EQUAL(matrix.at(2, 1), 8);
    CHECK_EQUAL(matrix.at(2, 2), 9);
}

UNIT_TEST(MatrixValuesAccess, ConstantAccessVector) {
    using namespace linalg::primitives;
    using namespace std;

    vector<float> mat = {{1, 2, 3}};
    auto matrix = CMatrix(mat);
    CHECK_EQUAL(matrix.at(0, 0), 1); 
    CHECK_EQUAL(matrix.at(0, 1), 2);
    CHECK_EQUAL(matrix.at(0, 2), 3);
}

UNIT_TEST(MatrixValuesAccess, ConstantAccessEmptyInit) {
    using namespace linalg::primitives;
    using namespace std;

    auto matrix = CMatrix<int>(3, 2);
    CHECK_EQUAL(matrix.at(0, 0), 0); 
    CHECK_EQUAL(matrix.at(0, 1), 0);
    CHECK_EQUAL(matrix.at(1, 0), 0); 
    CHECK_EQUAL(matrix.at(1, 1), 0);
    CHECK_EQUAL(matrix.at(2, 0), 0); 
    CHECK_EQUAL(matrix.at(2, 1), 0);
}
// CHECKING elements access exceptions
UNIT_TEST(MatrixValuesAccess, OutOfBoundsConstantAccess) {
    using namespace linalg::primitives;
    using namespace std;

    auto matrix = CMatrix<int>(3, 2);
    CHECK_THROW(matrix.at(3, 0), std::out_of_range);
    CHECK_THROW(matrix.at(0, 2), std::out_of_range);
}

UNIT_TEST(MatrixValuesAccess, OutOfBoundsReferenceAccess) {
    using namespace linalg::primitives;
    using namespace std;

    auto matrix = CMatrix<int>(3, 2);
    int value = 0;
    CHECK_THROW(value = matrix[3][0], std::out_of_range);
    CHECK_THROW(value = matrix[0][2], std::out_of_range);
}

UNIT_TEST(MatrixEquality, MatrixesEqual) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<int>> mat1 = {{1,2,3}, {4,5,6}};
    vector<vector<int>> mat2 = {{1,2,3}, {4,5,6}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    CHECK_EQUAL(matrix1 == matrix2, true);
}

UNIT_TEST(MatrixEquality, MatrixesNotEqual) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<int>> mat1 = {{1,2,3}, {4,5,6}};
    vector<vector<int>> mat2 = {{1,2,3}, {4,6,6}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    CHECK_EQUAL(matrix1 == matrix2, false);
}

UNIT_TEST(MatrixNotEquality, MatrixesEqual) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<int>> mat1 = {{1,2,3}, {4,5,6}};
    vector<vector<int>> mat2 = {{1,2,3}, {4,5,6}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    CHECK_EQUAL(matrix1 != matrix2, false);
}

UNIT_TEST(MatrixNotEquality, MatrixesNotEqual) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<int>> mat1 = {{1,2,3}, {4,5,6}};
    vector<vector<int>> mat2 = {{1,2,3}, {4,6,6}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    CHECK_EQUAL(matrix1 != matrix2, true);
}

/// ADD operator on matrix
UNIT_TEST(MatrixAddition, MatrixAddition) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{1,2,3}, {1,2,3}, {1,2,3}};
    vector<vector<float>> mat2 = {{2,2,2}, {3,3,3}, {2,2,2}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    matrix1 = matrix1 + matrix2;
    CHECK_EQUAL(matrix1[0][0], 3);
    CHECK_EQUAL(matrix1[0][1], 4);
    CHECK_EQUAL(matrix1[0][2], 5);
    CHECK_EQUAL(matrix1[1][0], 4);
    CHECK_EQUAL(matrix1[1][1], 5);
    CHECK_EQUAL(matrix1[1][2], 6);
    CHECK_EQUAL(matrix1[2][0], 3);
    CHECK_EQUAL(matrix1[2][1], 4);
    CHECK_EQUAL(matrix1[2][2], 5);
}

UNIT_TEST(MatrixAddition, IncorrectDimensionsHeight) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{1,2,3}, {1,2,3}, {1,2,3}};
    vector<vector<float>> mat2 = {{2,2,2}, {3,3,3}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    CHECK_THROW(matrix1 = matrix1 + matrix2, std::logic_error);
}

UNIT_TEST(MatrixAddition, IncorrectDimensionsWidth) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{1,2,3}, {1,2,3}, {1,2,3}};
    vector<vector<float>> mat2 = {{2,2}, {3,3}, {1,2}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    CHECK_THROW(matrix1 = matrix1 + matrix2, std::logic_error);
}


UNIT_TEST(MatrixSubstraction, MatrixSubstraction) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{1,2,3}, {1,2,3}, {1,2,3}};
    vector<vector<float>> mat2 = {{2,2,2}, {3,3,3}, {2,2,2}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    matrix1 = matrix1 - matrix2;
    CHECK_EQUAL(matrix1[0][0], -1);
    CHECK_EQUAL(matrix1[0][1], 0);
    CHECK_EQUAL(matrix1[0][2], 1);
    CHECK_EQUAL(matrix1[1][0], -2);
    CHECK_EQUAL(matrix1[1][1], -1);
    CHECK_EQUAL(matrix1[1][2], 0);
    CHECK_EQUAL(matrix1[2][0], -1);
    CHECK_EQUAL(matrix1[2][1], 0);
    CHECK_EQUAL(matrix1[2][2], 1);
}

UNIT_TEST(MatrixSubstraction, IncorrectDimensionsHeight) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{1,2,3}, {1,2,3}, {1,2,3}};
    vector<vector<float>> mat2 = {{2,2,2}, {3,3,3}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    CHECK_THROW(matrix1 = matrix1 - matrix2, std::logic_error);
}

UNIT_TEST(MatrixSubstraction, IncorrectDimensionsWidth) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{1,2,3}, {1,2,3}, {1,2,3}};
    vector<vector<float>> mat2 = {{2,2}, {3,3}, {1,2}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    CHECK_THROW(matrix1 = matrix1 - matrix2, std::logic_error);
}

UNIT_TEST(MatrixMultiplication, MatrixByMatrix) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{3,1,2}, {2,0,2}};
    vector<vector<float>> mat2 = {{4}, {5}, {6}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    matrix1 = matrix1 * matrix2;
    CHECK_EQUAL(matrix1.cols(), mat2[0].size());
    CHECK_EQUAL(matrix1.rows(), mat1.size());
    CHECK_EQUAL(matrix1[0][0], 29);
    CHECK_EQUAL(matrix1[1][0], 20);
}

UNIT_TEST(MatrixMultiplication, MatrixByMatrixIncorrectDimensions) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{3,1,2}, {2,0,2}};
    vector<vector<float>> mat2 = {{4}, {5}, {6}};
    auto matrix1 = CMatrix(mat1);
    auto matrix2 = CMatrix(mat2);
    // should throw as width of mat2 and height of mat1 does not match
    CHECK_THROW(matrix2 * matrix1, std::logic_error);
}

UNIT_TEST(MatrixMultiplication, MatrixByScalar) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{3,1,2}, {2,0,2}};
    auto matrix1 = CMatrix(mat1);
    // should throw as width of mat2 and height of mat1 does not match
    matrix1 = matrix1 * 4;
    CHECK_EQUAL(matrix1[0][0], 12);
    CHECK_EQUAL(matrix1[0][1], 4);
    CHECK_EQUAL(matrix1[0][2], 8);
    // second row
    CHECK_EQUAL(matrix1[1][0], 8);
    CHECK_EQUAL(matrix1[1][1], 0);
    CHECK_EQUAL(matrix1[1][2], 8);
}

UNIT_TEST(MatrixMultiplication, ScalarByMatrix) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{3,1,2}, {2,0,2}};
    auto matrix1 = CMatrix(mat1);
    // should throw as width of mat2 and height of mat1 does not match
    matrix1 = 4 * matrix1;
    CHECK_EQUAL(matrix1[0][0], 12);
    CHECK_EQUAL(matrix1[0][1], 4);
    CHECK_EQUAL(matrix1[0][2], 8);
    // second row
    CHECK_EQUAL(matrix1[1][0], 8);
    CHECK_EQUAL(matrix1[1][1], 0);
    CHECK_EQUAL(matrix1[1][2], 8);
}

UNIT_TEST(MatrixTransposition, Transposition) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {{3,1,2}, {2,0,2}};
    auto matrix1 = CMatrix(mat1);
    // should throw as width of mat2 and height of mat1 does not match
    matrix1.Transpose();
    CHECK_EQUAL(matrix1[0][0], 3);
    CHECK_EQUAL(matrix1[0][1], 2);
    // second row
    CHECK_EQUAL(matrix1[1][0], 1);
    CHECK_EQUAL(matrix1[1][1], 0);
    // third row
    CHECK_EQUAL(matrix1[2][0], 2);
    CHECK_EQUAL(matrix1[2][1], 2);
}

UNIT_TEST(MatrixSymmetry, isSymmetric) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {
                            {1, 2, 3},
                            {2, 2, 5},
                            {3, 5, 3}
    };
    auto matrix1 = CMatrix(mat1);
    CHECK_TRUE(matrix1.isSymmetric());
}

UNIT_TEST(MatrixSymmetry, isSymmetricNotSquare) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {
                            {1, 2, 3},
                            {2, 2, 5}
    };
    auto matrix1 = CMatrix(mat1);
    CHECK_FALSE(matrix1.isSymmetric());
}

UNIT_TEST(MatrixSymmetry, notSymmetric) {
    using namespace linalg::primitives;
    using namespace std;

    vector<vector<float>> mat1 = {
                            {1, 2, 3},
                            {2, 2, 5},
                            {3, 4, 3}
    };
    auto matrix1 = CMatrix(mat1);
    CHECK_FALSE(matrix1.isSymmetric());
}