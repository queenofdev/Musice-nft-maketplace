import React, { useState } from 'react';
import styled from 'styled-components';



const Container  =  styled.div`
  position : fixed;
  width : 50vw;
  height : 50vh;
  background : red;
  z-index:100;

`
const Modal_Container  =  styled.div`

`

const AudioModal = ({ show, onClose, audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    setIsPlaying(true);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  return (
    <Container show ={show}>
      <Modal_Container>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Audio Player</h2>
        <button onClick={playAudio} disabled={isPlaying}>
          {isPlaying ? 'Playing...' : 'Play Audio'}
        </button>
      </div>
      </Modal_Container>
    </Container>
  );
};

export default AudioModal;