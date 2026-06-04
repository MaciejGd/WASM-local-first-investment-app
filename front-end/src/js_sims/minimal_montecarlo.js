export function priceToLogReturns(priceSeries) {
    return priceSeries.map(prices => {
        if (prices.length < 2) {
            throw new Error("Each stock needs at least two prices to compute returns.");
        }
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const prev = prices[i - 1];
            const current = prices[i];
            if (current === 0) {
                throw new Error("Stock price provided cannot be equal to zero.");
            }
            returns.push(Math.log(current / prev));
        }
        return returns;
    });
}

export function meanVector(matrix) {
    return matrix.map(row => row.reduce((sum, value) => sum + value, 0) / row.length);
}

export function covarianceMatrix(matrix) {
    const n = matrix.length;
    const t = matrix[0].length;
    const means = meanVector(matrix);
    const cov = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            let sum = 0;
            for (let k = 0; k < t; k++) {
                sum += (matrix[i][k] - means[i]) * (matrix[j][k] - means[j]);
            }
            const value = sum / (t - 1);
            cov[i][j] = value;
            cov[j][i] = value;
        }
    }
    return cov;
}

export function choleskyDecomposition(matrix) {
    const n = matrix.length;
    const L = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0;
            for (let k = 0; k < j; k++) {
                sum += L[i][k] * L[j][k];
            }
            if (i === j) {
                const diag = matrix[i][i] - sum;
                if (diag <= 0) {
                    throw new Error("Covariance matrix is not positive definite.");
                }
                L[i][j] = Math.sqrt(diag);
            } else {
                L[i][j] = (matrix[i][j] - sum) / L[j][j];
            }
        }
    }
    return L;
}

export function multiplyLowerTriangular(matrix, vector) {
    return matrix.map((row, i) => {
        let sum = 0;
        for (let j = 0; j <= i; j++) {
            sum += row[j] * vector[j];
        }
        return sum;
    });
}

export function gaussianRandom() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function getPercentiles(data) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Percentile data must be a non-empty array.");
    }
    const sorted = [...data].sort((a, b) => a - b);
    const percentiles = Math.floor(sorted.length / 10);
    return Array.from({ length: 9 }, (_, i) => sorted[(i + 1) * percentiles - 1]);
}

export function runSimulation({ priceSeries, weights, time, sims, randomSampleProvider }) {
    const stocks = priceSeries.length;
    if (weights.length !== stocks) {
        throw new Error("Weights length must match number of stocks.");
    }
    if (time <= 0) {
        throw new Error("Time must be greater than zero.");
    }
    if (sims <= 0) {
        throw new Error("Number of simulations must be greater than zero.");
    }
    if (!randomSampleProvider) {
        randomSampleProvider = size => Array.from({ length: size }, gaussianRandom);
    }

    const returns = priceToLogReturns(priceSeries);
    const means = meanVector(returns);
    const covariance = covarianceMatrix(returns);
    const cholesky = choleskyDecomposition(covariance);

    const outputs = Array.from({ length: sims }, () => ({ ret: 0, stocksChange: Array(stocks).fill(0) }));
    const drawdowns = Array(sims).fill(0);
    const upsides = Array(sims).fill(0);

    for (let i = 0; i < sims; i++) {
        const cumulativeLogChange = Array(stocks).fill(0);
        for (let t = 0; t < time; t++) {
            const randomNormals = randomSampleProvider(stocks, i, t);
            if (!Array.isArray(randomNormals) && !(randomNormals instanceof Float64Array)) {
                throw new Error('Random sample provider must return an array-like vector.');
            }
            if (randomNormals.length !== stocks) {
                throw new Error(`Random sample vector length ${randomNormals.length} does not match stocks ${stocks}.`);
            }
            if (randomNormals.some(v => Number.isNaN(v))) {
                throw new Error('Random sample provider returned NaN values.');
            }
            const correlated = multiplyLowerTriangular(cholesky, randomNormals);
            const motion = correlated.map((value, idx) => means[idx] + value);

            for (let s = 0; s < stocks; s++) {
                cumulativeLogChange[s] += motion[s];
            }

            const simpleReturns = cumulativeLogChange.map(x => Math.exp(x) - 1);
            const portfolioReturn = simpleReturns.reduce((sum, r, idx) => sum + r * weights[idx], 0);
            if (Number.isNaN(portfolioReturn)) {
                throw new Error('Portfolio return became NaN during simulation. Check input prices and random sample provider.');
            }

            outputs[i].ret = portfolioReturn;
            outputs[i].stocksChange = [...cumulativeLogChange];
            drawdowns[i] = Math.min(drawdowns[i], portfolioReturn);
            upsides[i] = Math.max(upsides[i], portfolioReturn);
        }
    }
    console.log("outputs before sort: ", outputs);
    const sortedOutputs = [...outputs].sort((a, b) => a.ret - b.ret);
    const bufferLength = 9 * 3 + 1 + weights.length;
    const buffer = Array(bufferLength).fill(0);

    const returnsPercentiles = getPercentiles(sortedOutputs.map(o => o.ret));
    console.log("Returns", outputs)
    console.log("Drawdowns", drawdowns)
    const drawdownsPercentiles = getPercentiles(drawdowns);
    const upsidesPercentiles = getPercentiles(upsides);

    returnsPercentiles.forEach((value, index) => { buffer[index] = value; });
    drawdownsPercentiles.forEach((value, index) => { buffer[9 + index] = value; });
    upsidesPercentiles.forEach((value, index) => { buffer[18 + index] = value; });

    const varIndex = Math.floor(sortedOutputs.length / 20) - 1;
    const varPos = Math.max(0, varIndex);
    const VAR = sortedOutputs[varPos].ret;
    buffer[27] = VAR;

    const tailOutputs = sortedOutputs.filter(output => output.ret <= VAR);
    const tailCount = tailOutputs.length || 1;
    const averageExpReturns = Array(stocks).fill(0);

    tailOutputs.forEach(output => {
        output.stocksChange.forEach((value, idx) => {
            averageExpReturns[idx] += Math.exp(value) - 1;
        });
    });
    for (let idx = 0; idx < stocks; idx++) {
        averageExpReturns[idx] /= tailCount;
        buffer[28 + idx] = averageExpReturns[idx] * weights[idx];
    }

    return {
        buffer,
        sortedOutputs,
        drawdowns,
        upsides,
        VAR,
        CVaR: buffer.slice(28, 28 + stocks),
    };
}

const days_back = 300;

function createStockArray(stock_prices) {
    const stocks_amount = stock_prices.length;
    const prices = new Float64Array(days_back * stocks_amount);
    for (let i = 0; i < stocks_amount; i++) {
        const element = stock_prices[i];
        if (!element || !element.prices) {
            throw new Error('Stock entry must contain a prices object.');
        }
        const curr_prices = Object.values(element.prices);
        if (curr_prices.length < days_back) {
            throw new Error(`Stock ${i} has only ${curr_prices.length} price points; expected ${days_back}.`);
        }
        let idx = curr_prices.length - 1;
        for (let j = 1; j <= days_back; j++, idx--) {
            const value = curr_prices[idx];
            if (typeof value !== 'number' || Number.isNaN(value)) {
                throw new Error('Stock prices must be valid numbers.');
            }
            prices[(i + 1) * days_back - j] = value;
        }
    }
    return prices;
}

function createWeightsArray(stock_weights) {
    var sum = stock_weights.reduce((a, b) => { return a + b}, 0);
    var weights = new Float64Array(stock_weights.length);
    var new_weights = stock_weights.map((el) => { return el / sum });
    weights.set(new_weights);
    console.log()
    return weights;
}

// WASM-like wrapper matching signature from wasm/core/main.cpp
// runSimulations(stocksFlat, weights, stocks_amount, stock_size, time, sims, resultsBuf)
export function runSimulations(stocksFlat, weights, time, sims) {
    if (stocksFlat == null) {
        throw new Error('stocksFlat must be provided.');
    }

    if (Array.isArray(stocksFlat) && stocksFlat.length > 0 && typeof stocksFlat[0] === 'object') {
        stocksFlat = createStockArray(stocksFlat);
    } else if (stocksFlat instanceof Float64Array || Array.isArray(stocksFlat)) {
        stocksFlat = Array.from(stocksFlat);
    } else {
        throw new Error('stocksFlat must be a numeric flat array or an array of stock objects.');
    }

    if (!Array.isArray(weights) && !(weights instanceof Float64Array)) {
        throw new Error('weights must be a numeric array.');
    }
    weights = createWeightsArray(Array.from(weights));
    const stocks_amount = weights.length;
    const stock_size = stocksFlat.length / stocks_amount;

    if (typeof stocks_amount !== 'number' || typeof stock_size !== 'number') {
        throw new Error('stocks_amount and stock_size must be provided as numbers.');
    }
    console.log("Stocks flat length: ", stocksFlat.length);
    console.log("Stocks amount: ", stocks_amount);
    console.log("Stocks size: ", stock_size);
    if (stocksFlat.length !== stocks_amount * stock_size) {
        throw new Error('stocksFlat length does not match stocks_amount * stock_size.');
    }

    if (stock_size < 2) throw new Error('Chunk size of stock prices should be at least two to count returns!');
    if (stocks_amount <= 0) throw new Error('Analyzed stock amounts should be at least one!');

    const priceSeries = [];
    for (let i = 0; i < stocks_amount; i++) {
        const start = i * stock_size;
        priceSeries.push(stocksFlat.slice(start, start + stock_size));
    }
    time = parseInt(time);
    sims = parseInt(sims);
    const out = runSimulation({ priceSeries, weights, time, sims });
    const buf = out.buffer;
    return buf;
}

// Example invocation (only run when example variables are present)
if (typeof prices !== 'undefined' && typeof weights !== 'undefined' && typeof time !== 'undefined' && typeof sims !== 'undefined') {
    try {
        const result = runSimulation({
            priceSeries: prices,
            weights,
            time,
            sims,
        });
        // if a generator exists and user wants deterministic samples, they can pass it into tests
    }
    catch (e) {
        // swallow errors from example invocation when used as a module
    }
}
export class TestRandomGenerator {
    constructor() {
        this.data = [
            [-0.19, -0.01, -1.37],
            [0.02, 0.57, 2.14],
            [0.45, -0.79, 0.41],
            [-0.38, 0.97, -1.59],
            [0.61, 0.09, 0.10],
            [0.26, 1.45, -1.56],
            [0.46, -0.92, -0.56],
            [0.39, -1.07, -0.17],
            [-1.30, -0.08, 0.31],
            [-0.03, 1.87, 0.37],
            [0.27, 0.01, -1.63],
            [0.04, 0.07, 0.66],
            [-0.37, -0.12, 0.86],
            [-0.43, -0.15, -1.20],
            [2.73, 0.52, 1.36],
            [0.98, -1.19, 0.07],
            [1.02, 1.71, -1.41],
            [-2.36, 1.44, -0.62],
            [0.16, 1.17, 1.98],
            [-0.11, -0.37, 0.09],
            [0.22, 1.09, 0.27],
            [-0.47, 0.56, -0.80],
            [-0.32, -0.48, 0.40],
            [-1.15, -0.19, 0.17],
            [3.19, -0.06, -0.12],
            [-0.60, 0.31, 0.37],
            [-1.47, 1.57, -1.45],
            [0.11, -2.12, 0.65],
            [-0.69, -0.11, 1.64],
            [-0.27, -0.093, 1.0],
            [-0.81, 0.65, 0.97],
            [-1.36, 0.81, -1.05],
            [0.14, -0.69, 0.10],
            [-0.63, -0.12, 0.51],
            [-0.24, 0.70, -0.16],
            [-0.34, -0.08, -0.74],
            [0.26, 1.33, -0.97],
            [-2.05, -0.025, 0.22],
            [-1.08, -0.88, -0.68],
            [-0.51, -0.88, -0.43],
            [0.64, -0.54, -0.04],
            [0.071, -0.90, 1.18],
            [-0.32, -0.57, 1.84],
            [-1.26, 0.61, -0.42],
            [-0.10, -0.34, -1.4],
            [0.30, -0.20, 1.18],
            [-0.65, -0.79, -0.68],
            [-0.60, -0.94, -1.26],
            [-2.34, -0.44, -2.68],
            [0.69, -0.019, -1.01],
            [0.508193, 1.25777, -1.04248],
            [-1.08744, 0.39644, 0.493098],
            [0.576084, -0.0805815, 1.44284],
            [1.18317, 0.208409, 1.36491],
            [0.111852, -1.87317, 2.09622],
            [-0.752641, 0.229195, -1.04893],
            [-0.292133, -0.519732, -1.07381],
            [0.540665, -0.0640594, 1.01553],
            [-2.23279, -0.522869, 1.01974],
            [0.879056, 0.244449, -0.946964],
            [-0.238884, -0.935514, 0.91621],
            [-0.73763, -0.653948, 0.362986],
            [-0.147578, -0.725908, 1.43087],
            [-1.16066, -0.800722, 0.409834],
            [1.17165, -0.163111, 0.0425847],
            [-0.293317, 0.184021, 0.483496],
            [0.106194, -0.252728, -0.62501],
            [-1.7014, -0.743361, 1.05491],
            [0.840667, -1.35457, 1.13979],
            [-0.69959, 0.282302, -0.548771],
            [0.926868, 0.327958, 1.61403],
            [0.196347, -0.608139, 0.35722],
            [0.726418, -0.370961, -0.388522],
            [-1.16781, 1.94092, 0.881583],
            [0.196557, -2.32647, 0.497231],
            [-0.985032, 0.078109, -0.382601],
            [0.939276, 0.123579, -0.0890286],
            [0.267873, 0.00632345, 0.309938],
            [0.855939, -1.45797, 0.122875],
            [1.2456, 0.805029, -0.112876],
            [0.226636, 0.364071, 0.332235],
            [0.571056, -1.13575, -0.53249],
            [-1.3782, 0.673571, 1.20086],
            [0.37893, -0.588209, 0.159134],
            [0.559347, -0.651986, 0.529052],
            [-0.638641, 0.332571, 0.361464],
            [0.48295, 1.07514, 0.14195],
            [-0.218935, 0.929282, 1.77458],
            [1.15829, -0.612682, 0.00506883],
            [0.721346, -1.00271, -0.88744],
            [0.384715, -1.97474, -0.906562],
            [-0.454313, -0.165979, -1.24253],
            [-1.4617, -1.05571, 1.14338],
            [-0.155255, 1.47548, -0.643583],
            [0.000889046, 0.472651, 0.439133],
            [0.666788, 0.264937, -1.69653],
            [0.159886, 0.123942, 1.71866],
            [-0.565609, -0.689291, 0.481996],
            [0.925075, 0.178276, -1.28287],
            [-0.927214, 0.240567, 0.245048],
        ];
        this.index = 0;
    }

    next(size) {
        if (this.index >= this.data.length) {
            throw new Error("TestRandomGenerator ran out of sample vectors.");
        }
        const value = this.data[this.index++];
        if (value.length !== size) {
            throw new Error(`Request size ${size} did not match test sample length ${value.length}.`);
        }
        return [...value];
    }
}
