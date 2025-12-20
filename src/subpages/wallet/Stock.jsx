import '../../styling/pop_up.css';
import '../../styling/wallet.css';
import { useState } from 'react';
import AddAssetPopUp from './AddAssetPopUp';

function AddAssetButton({onAddPress}) {
    return (<div><button className="assets_add_button" onClick={onAddPress}>Add asset</button></div>);
}

function AssetPanel({assets}) {
    return (
    <>
        <AssetsTable assets={assets}/>
    </>
    );
}

function AssetsTableHead() {
    return (
        <tr>
            <th>Company</th>
            <th>Quantity</th>
            <th>Price</th>
        </tr>
    );
}

function AssetsTableBody({assets}) {
    return (
        <>
        {assets.map((asset, rowIdx)=> (
            <tr key={rowIdx}>
                {asset.map((asset_data, colIdx) => (
                    <td key={colIdx}>
                        {asset_data}
                    </td>
                ))}
            </tr>
        ))}
        </>
    );
}

function AssetsTable({ assets }) {
    return (
        <table>
            <thead>
            <AssetsTableHead/>
            <AssetsTableBody assets={assets}/>
            </thead>
        </table>
    );
}


export default function StockPage() {
    const [modal_visible, setModalVisible] = useState(false);
    const [assets, setAssets] = useState([]);

    function toggleModalVisibility() {
        setModalVisible(!modal_visible);
    }
    const Modal = modal_visible ? AddAssetPopUp : () => (<></>);

    function addAsset(company, quantity, price) {
        console.log("set assets: " + company + " " + quantity + " " + price);
        setAssets([...assets, [company, quantity, price]]);
        // hide modal on accept as well
        // toggleModalVisibility(); TODO, change that
    }

    return (
        <>
            <h1>Stock subpage!</h1>
            <AddAssetButton onAddPress={toggleModalVisibility}></AddAssetButton>
            <AssetPanel assets={assets}></AssetPanel>
            {/* Modal to be opened when proper button pressed */}
            <Modal onClose={toggleModalVisibility} onAccept={addAsset}/>
        </>
    );
}