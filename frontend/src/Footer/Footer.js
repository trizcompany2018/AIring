import styled from 'styled-components'
import InfoText from './InfoText'

const FootContainer = styled.div`

display: flex;
flex-direction: column;
margin-bottom: 40px;
margin-top: 40px;
align-items: center;

`
const Foot = styled.div`

  text-align: center;
  font-size: 12px;
  font-weight: 400;
  // 페이지에 따라 다르게 텍스트 색상 설정
  color: ${(props) => props.colour};

`

const Footer = ({ colour }) => {

  return (
    <FootContainer>
      <InfoText />
      <Foot colour={colour}>© 2025-2026. Triz co. All rights reserved.</Foot>
    </FootContainer>
  )

}

export default Footer;