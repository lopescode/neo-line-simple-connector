import { useEffect, useState } from 'react';
import logo from './logo.png';
import './App.css';

const App = () => {
  const [neoline, setNeoLine] = useState<any>();
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [displayDisconnect, setDisplayDisconnect] = useState(false);

  useEffect(() => {
    window.addEventListener("NEOLine.NEO.EVENT.READY", () => {
      setNeoLine(new window.NEOLineN3.Init());
    });
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (account) {
        setDisplayDisconnect(true);
        return
      }

      const { address } = await neoline?.getAccount();
      setAccount(address);
    } catch (error) {
      setError("Você precisa instalar a extensão do Neoline para usar essa funcionalidade. https://chromewebstore.google.com/detail/neoline/cphhlgmgameodnhkjdmkpanlelnlohao");
      console.log(error);
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      setAccount("");
      setDisplayDisconnect(false);
    } catch (error) {
      setError("Ocorreu um erro ao desconectar a carteira.");
      console.log(error);
    }
  }

  return (
    <div className="App">
      <header className="App-header flex gap-4">
        <img src={logo} className="bg-transparent" alt="logo" />
        
        <h1 className='text-3xl'>Neo line integration app</h1>
        
        <button className='rounded-xl text-xl font-semibold bg-blue-500 hover:bg-blue-700 px-4 py-2' onClick={handleConnectWallet}>
          { account ? account : "Connect Neoline" }
        </button>

        { displayDisconnect && (
          <button className='rounded-xl text-xl font-semibold bg-red-500 hover:bg-red-700 px-4 py-2' onClick={handleDisconnectWallet}>
            Disconnect
          </button>
        ) }

        { error && (
          <p className='text-red-500 text-center'>{error}</p>
        ) }
      </header>
    </div>
  );
}

export default App;
