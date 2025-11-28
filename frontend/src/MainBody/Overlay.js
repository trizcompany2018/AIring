import styled from "styled-components"
import RoadingIcon from './roadingmotion_white.gif'

const OverlayContainer =  styled.div`

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* 회색 반투명 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 20px;
  pointer-events: all;

`

const Loading = styled.img`

width: 200px;

`


const Overlay = () => {

    return (
        <OverlayContainer>
            <Loading src={RoadingIcon} />
        </OverlayContainer>
    )

}

export default Overlay;