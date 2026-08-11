#pragma once
#include <array>
#include <vector>
#include <stdexcept>
#include "./simulation_output.h"

/// Wrapper for simmulation returns 
/// should provide a way to serialize so it can be returned from WASM module
class ISimsResults {
protected:
    // pointer to memory allocated for results
    double* t_buff = nullptr;
    virtual std::vector<double> t_CountPercentile(std::vector<double>& data) = 0; 

    /// @brief Append data to the buffer at specified position
    /// @param data vector containing data to be appended
    /// @param start_ptr starting index for appended data
    virtual void t_InsertToBuff(std::vector<double>& data, int start_ptr) = 0;
public:
    ISimsResults() = default;
    ISimsResults(double* buff) : t_buff(buff) {};
    virtual ~ISimsResults() = default;
    
    /// @brief Set output of the simulation
    /// @param sims_output output of the simulation wrapped in SimulationOutput object
    /// @param weights weights of particular stock. Needed for counting Component VaR
    virtual void SetSimOutput(SimulationOutput& sims_output, const CMatrix<double>& weights) = 0;

    /// @brief Count percentiles for drawdowns passed as input and add them to the buffer
    /// @param _drawdowns vector of drawdowns to be added to the buffer
    virtual void SetDrawdowns(std::vector<double>& _drawdowns) = 0;

    /// @brief Count percentiles for upsides passed as input and add them to the buffer
    /// @param _upsides vector of upsides to be added to the buffer
    virtual void SetUpsides(std::vector<double>& _upsides) = 0;
    
    /// Return pointer to the underlying buffer
    inline double* GetBuf() const { return t_buff; };
};

/// @brief Class for filling results buffer with simulation's data
class CSimsResults : public ISimsResults {
private:
    // underlying type should be double, so f64
    // percentyle 10, 20, 30, 40, 50, 60, 70, 80, 90
    inline static constexpr int s_MEASURES = 9; // 9 measure points for each statistic
    inline static constexpr int m_elements = s_MEASURES * 3; 
    inline static constexpr double s_VAR_DIVIDER = 20;
    inline static constexpr double s_PERCENTILE_DIVIDER = s_MEASURES + 1;
        
    int m_returns_ptr = 0; // Starting point for vars data
    int m_drawdowns_ptr =   s_MEASURES;         // Starting point for vars data
    int m_upsides_ptr =     s_MEASURES * 2;     // Starting point for vars data
    int m_var_ptr =         s_MEASURES * 3;     // insert var value at the end of percentiles data
    int m_cvar_ptr =        s_MEASURES * 3 + 1; // CVAR would occupy all up to last buff element
public:
    CSimsResults() = default;
    CSimsResults(double* buff): ISimsResults(buff) {};

    void SetSimOutput(SimulationOutput& sims_output, const CMatrix<double>& weights) override;
    void SetDrawdowns(std::vector<double>& _drawdowns) override;
    void SetUpsides(std::vector<double>& _upsides) override;

protected:
    std::vector<double> t_CountPercentile(std::vector<double>& data) override;
    void t_InsertToBuff(std::vector<double>& data, int start_ptr) override;
    // we should transform price from logarithmic to regular
    double t_TransformToExp(double value);
    void t_SetVAR(SimulationOutput& sims_output, CMatrix<double> weights);
    void t_SetReturns(std::vector<double>& sims_output);

    double t_ES = 0.0; // expected shortfall
};
