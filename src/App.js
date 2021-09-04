import {Web3ReactProvider} from '@web3-react/core';
import {Web3Provider} from '@ethersproject/providers';

import Header from './components/Header';
import Footer from './components/Footer';

import Content from './components/Containers';

import './App.css';

import DashBoard from './components/Lending/dashboard';


const getLibrary = (provider) => {
  const library = new Web3Provider(provider);
  library.pollingInterval = 2000;
  return library;
};

function App() {
  return (
  <Web3ReactProvider getLibrary={getLibrary}>
    <div className="App">
      <Header/>
      <Content>
          <DashBoard/>
      </Content>
      <Footer/>
    </div>
  </Web3ReactProvider>
  );
}

export default App;
