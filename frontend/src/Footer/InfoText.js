import styled from 'styled-components'

const TextBox = styled.div`

  text-align: center;
  font-size: 12px;
  font-weight: 400;
  color: black;
  width: 70vw;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
margin-bottom: 40px;

`

const InfoText = () => {

    return (

        <TextBox>
            Airup의 모든 콘텐츠와 산출물은 (주)트리즈컴퍼니의 자산입니다.<br /><br />
            (주)트리즈컴퍼니 업무에 한하여 사용할 수 있으며,  <br />Airup의 모든 콘텐츠와 산출물에 포함된 정보의 전부 또는 일부를 무단으로 사용(제3자 제공 및 배포, 복사, 사용, 다운로드 등)하는 것을 엄격히 금지합니다.<br />
            무단 사용시, 민형사상 책임을 물을수도 있습니다.<br /> 만약, 무단으로 사용되는 경우를 발견하시면, 바로 회사에 알려주시기 바랍니다.
        </TextBox>


    )


}

export default InfoText;