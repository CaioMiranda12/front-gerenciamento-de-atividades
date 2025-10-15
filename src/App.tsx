import { useEffect, useState } from "react";
import Board from "./components/Board";
import { Header } from "./components/Header";
import { getAllGroups } from "./services/groupService";
import type { GroupDTO } from "./types";

export default function App() {
  const [groups, setGroups] = useState<GroupDTO[]>([]);

  useEffect(() => {
    getAllGroups().then(setGroups);
  }, [])

  return (
    <div>
      <Header />
      <Board groups={groups} />
    </div>
  )
}
