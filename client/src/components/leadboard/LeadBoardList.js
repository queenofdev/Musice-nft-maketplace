const LeadBoardList = ({data}) => {
  return (
    <div className='overflow-auto custom-scrollbar pb-2.5'>
      <div className='min-w-[720px] lead-board-list mt-11 md:px-4'>
        <div className='flex px-4 pb-1 text-sm md:px-5 text-[#E7E7E8] uppercase'>
          <div className='basis-[20%] md:basis-[22%]'>Username</div>
          <div className='basis-[25%] md:basis-[22%]'>
            Total NFT
          </div>
          <div className='basis-[15%] md:basis-[15%]'>Songs owned</div>
          <div className='basis-[22%] md:basis-[21%]'>
            Avg royalties per song
          </div>
          <div className='flex-grow md:basis-[20%]'>Mixtapes owned</div>
        </div>
        {data &&  data.map((ar, index) => (
          <div
            key={index}
            className={`${
              index % 2 === 0 && 'bg-white bg-opacity-10'
            } flex py-2.5 leading-normal text-sm md:text-base font-open-sans px-4 md:px-5 mt-1 rounded text-[#E7E7E8]`}
          >
            <div className='basis-[20%] md:basis-[22%]'>
              <span className='text-primary'>{ar.username}</span>
            </div>
            <div className='basis-[25%] md:basis-[22%]'>{ar.total_NFT}</div>
            <div className='basis-[15%] md:basis-[15%]'>{ar.number_of_songNFT}</div>
            <div className='basis-[22%] md:basis-[21%]'>
              <span className='text-sweetTurquoise'>$268.40</span>
            </div>
            <div className='flex-grow md:basis-[20%] text-[#7D7A84]'>
              {ar.number_of_mixtapeNFT}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadBoardList;
