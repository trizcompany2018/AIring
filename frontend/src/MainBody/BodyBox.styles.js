import styled from 'styled-components'

export const BoxWrapper = styled.div`
  position: relative;
`;


export const BoxContainer = styled.div`

display: flex;
flex-direction: column;
align-tiems: center;s

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


export const Form = styled.form`
  display: flex;
  flex-direction: column;

`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.col || 3}, 1fr);
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

export const FormLabel = styled.label`
  font-size: 24px;
  font-weight: 700; 
  color: #374151;
    margin-bottom: 15px;
`;

export const FormControl = styled.input`
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 400;
`;

export const SelectControl = styled.select`
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 400;
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
