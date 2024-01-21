import { useEffect, useState } from 'react';
import logo from './logo.png';
import './App.css';
import { GleederHelper } from './helpers/GleederHelper';

const App = () => {
  const [neoline, setNeoLine] = useState<any>();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [displayDisconnect, setDisplayDisconnect] = useState(false);
  const [amountOutMinGas, setAmountOutMinGas] = useState('0');
  const [amountInNeo, setAmountInNeo] = useState('0');

  useEffect(() => {
    window.addEventListener("NEOLine.NEO.EVENT.READY", () => {
      setNeoLine(new window.NEOLineN3.Init());
    });
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (address) {
        setDisplayDisconnect(!displayDisconnect);
        return
      }

      const { address: addressResponse } = await neoline?.getAccount();
      setAddress(addressResponse);
      setError("");
    } catch (error) {
      setError("Você precisa instalar a extensão do Neoline para usar essa funcionalidade. https://chromewebstore.google.com/detail/neoline/cphhlgmgameodnhkjdmkpanlelnlohao");
      console.log(error);
    }
  }

  const handleChangeNeoValue = async (value: string) => {
    if (!value) {
      setAmountOutMinGas('0');
      return
    }

    const {amountOutMin} = await GleederHelper.getAmountsOut(value)
    setAmountInNeo(value)
    setAmountOutMinGas(amountOutMin);
  }

  const handleDisconnectWallet = async () => {
    setDisplayDisconnect(false);
    setAddress("");
    setError("");
    setAmountOutMinGas('0');
    setAmountInNeo('0');
  }

  const handleSwap = async () => {
    try {
      const { address } = await neoline?.getAccount();
      
      const { txid } = await GleederHelper.swapNeo(neoline, address, amountInNeo, amountOutMinGas);
      console.log(txid);
    } catch (error) {
      setError("Ocorreu um erro ao realizar a troca.");
      console.log(error);
    }
  }

  return (
    <div className="App">
      <div className="App-header gap-4">
        <img src={logo} alt="neo3-logo" />
        
        <h1 className='text-3xl'>Neo line integration app</h1>
        
        <button className='rounded-xl text-xl font-semibold bg-blue-500 hover:bg-blue-700 px-4 py-2' onClick={handleConnectWallet}>
          { address ? address : "Connect Neoline" }
        </button>

        { displayDisconnect && (
          <button className='rounded-xl text-xl font-semibold bg-red-500 hover:bg-red-700 px-4 py-2' onClick={handleDisconnectWallet}>
            Disconnect
          </button>
        ) }

        { error && (
          <p className='text-red-500 text-center'>{error}</p>
        ) }

        { address && (
          <div className='flex justify-center items-center flex-col mt-10 gap-10'>
            <div className='flex flex-col text-center gap-4'>
              <label className='text-xl font-semibold'>Insira a quantidade de NEO para a troca:</label>
              <input type="text" className="rounded-xl text-xl font-semibold bg-white-500 px-4 py-2 text-black" placeholder="Quantidade de NEO" onChange={(e) => handleChangeNeoValue(e.target.value)} />
            </div>

            <div className='flex flex-col text-center gap-2'>
              <p className='text-xl font-semibold'>GAS retornado (aproximado):</p>
              <p className="rounded-xl text-md font-semibold bg-white-500">{amountOutMinGas}</p>
            </div>

            <button className='w-40 bg-green-500 hover:bg-green-700 rounded-xl py-2 font-semibold' onClick={handleSwap}>Swap</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
