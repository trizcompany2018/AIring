import styled from 'styled-components'

export const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  background-color: #f4f1eb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

`;

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 48px;
`;

export const BoxContainer = styled.div`
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const BoxHeader = styled.div`
  width: 80vw;
`;


export const Box = styled.div`
  width: 80vw;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  border: 2px solid #05da88;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 10rem;
`;

export const PageTitle = styled.p`
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 8px;
`;

export const PageSubTitle = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #4b5563;
`;

export const FormActions = styled.div`
  display: flex;
  gap: 20px;
  padding-bottom: 40px;
  padding-top: 40px;
  align-items: center;
  justify-content: center;
  width: 80vw;
`;

export const BtnPrimary = styled.button`
  width: 300px;
  height: 48px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  background: #00e673;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const BtnSecondary = styled.button`
  border-radius: 10px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  width: 300px;
  height: 48px;
  background: #bbbbbb;
  color: #fff;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ScriptContainer = styled.div`

font-size: 1rem;

`
export const ScriptHeader = styled.div`

font-size: 20px;
font-weight: 800;
margin-bottom: 10px;

`
export const TextBox = styled.pre`

margin: 10px;
width: 70vw;
font-family: "Pretendard";
font-size: 14px;
white-space: pre-wrap;      /* 줄바꿈 유지 + 자동 줄바꿈 */
word-break: break-word;     /* 긴 단어도 강제 줄바꿈 */
overflow-wrap: break-word;  /* 브라우저 호환 */


`