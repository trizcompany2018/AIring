import * as S from './BodyBox.styles.js'
import TitleBox from "../TitleBox/Titlebox";
import Footer from '../Footer/Footer.js'
import MainHeader from "../MainHeader/MainHeader";
import InputContainer from './InputContainer.js';

const BodyBox = ({ onLogout }) => {


    return (
        <S.BoxContainer>
            <MainHeader onLogout={onLogout} page="main_w" />

            <TitleBox title="라이브 방송 대본 생성" text="제품 정보가 포함된 PDF를 업로드하면 AI가 방송 대본을 자동으로
                    생성해 드립니다."/>
            <S.Main>
                <InputContainer />
            </S.Main>
            <Footer colour="#09CE74" />
        </S.BoxContainer >
    )

}

export default BodyBox;