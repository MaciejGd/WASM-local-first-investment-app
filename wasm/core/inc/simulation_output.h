#include "../linalg/matrix.h"
#include <algorithm>

using namespace linalg::primitives;

struct SimulationOutput {
    using output_pair = std::pair<double, CMatrix<double>>;
    // create one vector with the values
    std::vector<output_pair> output;

    SimulationOutput(size_t sims, size_t weights) {
        output = std::vector<output_pair>(sims, {0.0, CMatrix<double>(weights, 1)});
    }

    /// @brief Sort simulation outputs
    void sort() {
        std::sort(output.begin(), output.end(), [](const auto& a, const auto& b) {
            return a.first < b.first;
        });
    }

    /// @brief Get returns at index specified as argument
    /// @param idx index of return we want to get
    /// @return returned double from results index
    inline double& GetRet(size_t idx) {
        return output[idx].first;
    }

    /// @brief Get stock changes of particular simulation specified by idx
    /// @param idx sim index we want to retrieve
    /// @return CMatrix object with stocks change for specified idx
    inline CMatrix<double>& GetStocksChange(size_t idx) {
        return output[idx].second;
    }

    /// @brief Get vector of only results from the output
    /// @return vector of results
    inline std::vector<double> GetRets() const {
        std::vector<double> rets(output.size(), 0.0);
        for (size_t i = 0; i < rets.size(); i++) {
            rets[i] = output[i].first;
        }
        return rets;
    }

    /// @brief Get size of underlying container
    /// @return size of underlying container
    inline constexpr size_t size() const {
        return output.size();
    }

    // TODO - can we return the Matrix ref in here???
    inline std::vector<CMatrix<double>> GetStocksChanges() {
        std::vector<CMatrix<double>> changes(output.size(), CMatrix<double>());
        for (size_t i = 0; i < changes.size(); i++) {
            changes[i] = output[i].second;
        }
        return changes;
    }
};