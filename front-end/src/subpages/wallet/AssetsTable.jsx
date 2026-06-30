import { ArrowUpIcon, ArrowDownIcon } from "../../IconLoader";

function AssetsTableHead({ onSortUp, onSortDown }) {
  return (
    <tr>
      <th>
        <div className="table_header">
          <span>Ticker</span>
          <AssetsTableSortButtons
            onSortUp={onSortUp}
            onSortDown={onSortDown}
            columnName={"ticker"}
          />
        </div>
      </th>
      <th>
        <div className="table_header">
          <span>Quantity</span>
          <AssetsTableSortButtons
            onSortUp={onSortUp}
            onSortDown={onSortDown}
            columnName={"quantity"}
          />
        </div>
      </th>
      <th>
        <div className="table_header">
          <span>Price</span>
          <AssetsTableSortButtons
            onSortUp={onSortUp}
            onSortDown={onSortDown}
            columnName={"price"}
          />
        </div>
      </th>
      <th>
        <div className="table_header">
          <span>Cost</span>
          <AssetsTableSortButtons
            onSortUp={onSortUp}
            onSortDown={onSortDown}
            columnName={"cost"}
          />
        </div>
      </th>
      <th>
        <div className="table_header">
          <span>Current Price</span>
          <AssetsTableSortButtons
            onSortUp={onSortUp}
            onSortDown={onSortDown}
            columnName={"current_price"}
          />
        </div>
      </th>
      <th>
        <div className="table_header">
          <span>Current Value</span>
          <AssetsTableSortButtons
            onSortUp={onSortUp}
            onSortDown={onSortDown}
            columnName={"current_value"}
          />
        </div>
      </th>
      <th>
        <div className="table_header">
          <span>Profit</span>
          <AssetsTableSortButtons
            onSortUp={onSortUp}
            onSortDown={onSortDown}
            columnName={"profit"}
          />
        </div>
      </th>
      <th>
        <div className="table_header">
          <span>Profit-percentage</span>
          <AssetsTableSortButtons
            onSortUp={onSortUp}
            onSortDown={onSortDown}
            columnName={"profit_percentage"}
          />
        </div>
      </th>
    </tr>
  );
}

// table sorting buttons
function AssetsTableSortButtons({ onSortUp, onSortDown, columnName }) {
  return (
    <div className="sort_buttons">
      <button onClick={() => onSortUp(columnName)}>
        <ArrowUpIcon />
      </button>
      <button onClick={() => onSortDown(columnName)}>
        <ArrowDownIcon />
      </button>
    </div>
  );
}

function AssetsTableBody({ assets, onToggleVisibility, onSelectRow }) {
  // prepare data for rendering table
  const assets_array = assets.produceTableData();
  const assets_summary = assets.summary;
  return (
    <>
      {/* render regular rows */}
      {assets_array.map((asset, rowIdx) => (
        <AssetRow
          asset={asset}
          key={rowIdx}
          rowClassName={""}
          onToggleVisibility={onToggleVisibility}
          onSelectRow={onSelectRow}
        />
      ))}
      {/* render summary row */}
      <AssetRow
        asset={assets_summary}
        rowClassName={"assets_summary"}
        onToggleVisibility={onToggleVisibility}
        summary={true}
      />
    </>
  );
}

export function AssetRow({
  asset,
  rowClassName,
  onToggleVisibility,
  summary,
  onSelectRow,
}) {
  var profit_color = "";
  try {
    const float_percentage = parseFloat(asset.profit_percentage);
    if (float_percentage > 0) {
      profit_color = "#46D462";
    } else if (float_percentage < 0) {
      profit_color = "#E85454";
    } else {
      profit_color = "white";
    }
  } catch (exception) {
    console.log(exception);
  }

  return (
    <tr className={rowClassName}>
      <td>
        <div className="row_ticker">
          {!summary && (
            <input
              type="checkbox"
              checked={asset.selected}
              onChange={() => {
                const check_value = !asset.selected;
                onSelectRow(asset.ticker, asset.idx, check_value);
              }}
            ></input>
          )}
          <div className="row_ticker_content">
            <span
              className="row_ticker_name"
              style={{ fontWeight: "bold", paddingLeft: 20 }}
            >
              {asset.ticker}
            </span>
            {asset.isFirst && (
              <button onClick={() => onToggleVisibility(asset.ticker)}>
                {asset.isFolded ? <ArrowDownIcon /> : <ArrowUpIcon />}
              </button>
            )}
          </div>
        </div>
      </td>
      <td>{asset.quantity}</td>
      <td>{asset.price}</td>
      <td>{asset.cost}</td>
      <td>{asset.current_price}</td>
      <td>{asset.current_value}</td>
      <td>{asset.profit}</td>
      <td className="row_profit" style={{ color: profit_color }}>
        {asset.profit_percentage}
      </td>
    </tr>
  );
}

export function AssetsTable({
  assets,
  onToggleVisibility,
  onSortUp,
  onSortDown,
  onSelectRow,
}) {
  return (
    <table className="assets_table sims_asset_table">
      <thead>
        <AssetsTableHead onSortDown={onSortDown} onSortUp={onSortUp} />
      </thead>
      <tbody>
        <AssetsTableBody
          assets={assets}
          onToggleVisibility={onToggleVisibility}
          onSelectRow={onSelectRow}
        />
      </tbody>
    </table>
  );
}
