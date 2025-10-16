import Board from "./components/Board";

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {

  return (
    <>
      <Board />

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  )
}
