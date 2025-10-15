import Board from "./components/Board";
import { Header } from "./components/Header";

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {

  return (
    <><div>
      <Header />
      <Board />

    </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" /></>
  )
}
