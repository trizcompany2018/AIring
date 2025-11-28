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

width: 100vw;
display: flex;
justify-content: center;
align-items: center;


`


const BoxHeader = styled.div`
    width: 90vw;

`;


const TitleBox = () => {

    return (
        <BoxContainer>
            <BoxHeader>
                <PageTitle>라이브 방송 대본 생성</PageTitle>
                <PageSubTitle>
                    제품 정보가 포함된 PDF를 업로드하면 AI가 방송 대본을 자동으로
                    생성해 드립니다.
                </PageSubTitle>
            </BoxHeader>
        </BoxContainer>
    )


}

export default TitleBox;