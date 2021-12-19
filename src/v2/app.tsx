import * as React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import Main from "./views/main";
import "semantic-ui-css/semantic.min.css";
import "../ui.css";

type TProps = {};

export default function App(props: TProps) {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}
