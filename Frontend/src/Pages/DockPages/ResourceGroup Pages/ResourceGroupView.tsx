interface ResourceGroupProps {
  setActiveView: (view: string) => void;
}

function ResourceGroup({ setActiveView }: ResourceGroupProps) {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center w-full h-full z-10 gap-6 p-0 md:p-6">
      <div className="w-full h-full flex flex-col items-center justify-center bg-black p-6 rounded-lg shadow-lg"></div>
    </div>
  );
}

export default ResourceGroup;
