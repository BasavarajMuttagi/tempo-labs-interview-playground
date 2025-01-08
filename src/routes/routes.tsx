import { createBrowserRouter } from "react-router-dom";
import Test from "../components/Test";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Test />,
  },
]);
export default routes;
