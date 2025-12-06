import './App.css'
import StockPage from './subpages/Stock.jsx'
import SettingsPage from './subpages/Settings.jsx'
import {useState} from 'react'


/*
In our app component we want to render different parts of code
*/
function NavField({name, onNavChange, subPageComponent}) {
  return (
    <button onClick={()=> onNavChange(subPageComponent)}>
      {name}
    </button>
  );
}

function ContentContainer({Subpage}) {
  return (<Subpage/>);
}

export default function App() {
  console.log('StockPage:', StockPage, typeof StockPage);
  const [CurrentSubpage, setCurrentSubpage] = useState(() => StockPage);

  return (
    <>
      <h1>Investment App</h1>
      <NavField name="Stock" onNavChange={setCurrentSubpage} subPageComponent={() => StockPage}></NavField>
      <NavField name="Settings" onNavChange={setCurrentSubpage} subPageComponent={() => SettingsPage}></NavField>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more 
      </p>
      <ContentContainer Subpage={CurrentSubpage}/>
    </>
  )
}


// export default App

