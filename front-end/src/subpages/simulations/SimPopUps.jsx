import "../../components/PopUp";
import { ErrorPopUp, PopUpButtons, PopUpComponent } from "../../components/PopUp";

export function SimRunningPopUp({ onClose }) {
  return (
    <PopUpComponent
      title="Simulation running"
      buttons={
        <PopUpButtons onClose={onClose} content={"Abort"}></PopUpButtons>
      }
    ></PopUpComponent>
  );
}
