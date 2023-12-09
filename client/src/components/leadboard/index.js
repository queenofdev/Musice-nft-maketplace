import React, {useContext, useEffect, useState} from 'react';
import cloneDeep from 'lodash/cloneDeep'
import LeadBoardHead from './LeadBoardHead';
import LeadBoardList from './LeadBoardList';
import NeverMissCTA from '../NeverMissCTA';
import { UserContext } from '@/context/UserContext';

export default function LeadBoard() {

 const { getTopUsers ,state} = useContext(UserContext);
 const {leaderboard_list} = state;
 const [list, setList] = useState([]);
 const [tempList, setTempList] = useState([]);
 const [ search, setSearch ] = useState("");

 useEffect(() => {
  getTopUsers();
 },[]);

 useEffect(() => {
  if(leaderboard_list.length>0) {
    setList(cloneDeep(leaderboard_list));
  }
 },[leaderboard_list]);

 useEffect(() => {
  if(typeof list === 'object' && list.length>0) {
    let temp = cloneDeep(list);
    temp = temp.filter(item =>  {
      const name = item.username;
      if(name !== undefined) {
        return  (name.indexOf(search) >= 0)
      } else return false;
    });
    setTempList(cloneDeep(temp));
  }
 },[search, list])

  return (
    <div className='lead-board'>
      <div className='max-w-[1400px] px-5 mx-auto  pt-10 lg:pt-[91px] mb-20 min-h-screen'>
        <h2 className='text-4xl font-bold text-center lg:text-6xl'>
          Leaderboard
        </h2>
        <div className='pt-8'>
          <LeadBoardHead 
            searchString={search}
            setSearchString={(v)=> setSearch(v)}
          />
          <LeadBoardList data={tempList}/>
        </div>
      </div>
      <NeverMissCTA />
    </div>
  );
}
