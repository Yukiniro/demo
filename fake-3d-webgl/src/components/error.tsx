import { Empty } from "@douyinfe/semi-ui";
import Layout from "./layout";
import { IllustrationConstruction, IllustrationFailureDark } from "@douyinfe/semi-illustrations";

const WIDTH = 300;
const HEIGHT = 300;

function Error(props: { errorMessage: string }) {
  const { errorMessage } = props;
  return (
    <Layout>
      <Empty
        image={<IllustrationConstruction style={{ width: WIDTH, height: HEIGHT }} />}
        darkModeImage={<IllustrationFailureDark style={{ width: WIDTH, height: HEIGHT }} />}
        description={errorMessage || "Load Failed!"}
      />
    </Layout>
  );
}

export default Error;
