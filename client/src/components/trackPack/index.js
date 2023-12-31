import TrackAvatar from './TrackAvatar';
import TrackDetails from './TrackDetails';

export default function TrackPack() {
  return (
    <div className='relative mosh-container-normal after:absolute trackAfterBg after:w-[917px] after:h-[917px] after:rounded-full after:top-10 after:left-[-50%] after:z-[-1] after:blur-[110px] after:opacity-80 '>
      <div className='flex flex-row flex-wrap items-center'>
        <div className=' md:basis-[45%] md:w-[45%] lg:basis-[40%] lg:w-[40%] xl:basis-[48%] xl:w-[48%] w-full basis-full'>
          <TrackAvatar />
        </div>
        <div className=' md:basis-[55%] md:w-[55%] lg:basis-[60%] lg:w-[60%] xl:basis-[52%] xl:w-[52%] w-full basis-full'>
          <TrackDetails />
        </div>
      </div>
    </div>
  );
}
