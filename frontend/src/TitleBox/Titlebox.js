import styled from 'styled-components'

const PageTitle = styled.p`
  font-size: 40px;
  font-weight: 700; /* Bold */
  margin-bottom: 8px;
`;

const PageSubTitle = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #4b5563;
`;

const BoxContainer = styled.div`

margin-top: 2rem;
display: flex;
justify-content: center;
align-items: center;

`

const BoxHeader = styled.div`

width: 80vw;

`;


const TitleBox = ({ text }) => {

    return (
        <BoxContainer>
            <BoxHeader>
                <PageTitle>라이브 방송 대본 생성</PageTitle>
                <PageSubTitle>
                    {text}
                </PageSubTitle>
            </BoxHeader>
        </BoxContainer>
    )


}

export default TitleBox;