function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto h-screen flex justify-center items-center">
      <h1 className="text-6xl pb-12 fixed top-8 left-1/2 -translate-x-1/2">Fake 3D</h1>
      {props.children}
    </div>
  );
}

export default Layout;
