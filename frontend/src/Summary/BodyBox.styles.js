import styled from 'styled-components'

export const BoxWrapper = styled.div`
  position: relative;
`;


export const BoxContainer = styled.div`

display: flex;
flex-direction: column;
align-tiems: center;

`
export const Main = styled.div`

  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 48px;
`;

export const Box = styled.div`
  width: 80vw;
  background: #fff;
  border-radius: 20px;
  padding-left: 40px; 
  padding-right: 40px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  border: 2px solid #05DA88;
  display: flex;
  flex-direction: column;
padding-top: 40px;
`;


export const UploadBox = styled.div`
  border-radius: 16px;
  border: 2px dashed #22c55e;
  background: #eafff1;
  text-align: center;
  padding: 24px;
`;
export const UploadIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
`;

export const UploadText = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #047857;
`;

export const FormActions = styled.div`
  display: flex;
  gap: 20px;
    padding-bottom: 40px;
    padding-top: 40px;
  align-items: center;
  justify-content: center;
`;

export const BtnPrimary = styled.div`
  width: 300px;
  height: 48px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  background: #00E673;
  color: #fff;
  font-weight: 700; /* Bold */
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const BtnSecondary = styled.div`

  border-radius: 10px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  width: 300px;
  height: 48px;

  background: #BBBBBB;
  color: #fff;
  font-weight: 400;
    display: flex;
  align-items: center;
  justify-content: center;
`;

export const FileBox = styled.input`

display: none;

`