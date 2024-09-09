import { Divider } from "@douyinfe/semi-ui";

function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full">
      <h1 className="text-6xl text-center h-32 leading-loose">Fake 3D</h1>
      <Divider />
      {props.children}
    </div>
  );
}

export default Layout;
