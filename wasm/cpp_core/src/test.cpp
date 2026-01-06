#include "../inc/test.h"

int test_file(int test) {
    int num_val = 12;
    for (int i = 1; i < test; i++) {
        num_val %= i;
    }
    return 0;
}
