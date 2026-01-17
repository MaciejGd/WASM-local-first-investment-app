#pragma once
#include "../../core/inc/matrix.h"
#include "tests_runner.h"

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