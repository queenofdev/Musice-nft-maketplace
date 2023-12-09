import React from "react";
import classnames from "classnames";

export default function WithdrawModal({
  visible,
  setModalVisible,
  title,
  children,
}) {
  return (
    <>
      <div
        className={classnames(
          "justify-center p-8 items-center flex overflow-x-hidden overflow-y-auto fixed inset-0  outline-none focus:outline-none backdrop-blur-sm",
          { "-z-10 opacity-0 ": !visible, "fade-in z-20": visible }
        )}
      >
        <div
          className={classnames("relative w-auto my-6 mx-auto max-w-3xl ", {
            "z-20 fade-in": visible,
          })}
        >
          <div className="border-0 rounded-lg  relative flex flex-col w-full  outline-none focus:outline-none modal-shadow border-solid border-orange-500 border-2 bg-slate-700 ">
            <div className="flex items-start justify-between p-5  rounded-t ">
              <h3 className="text-xl font-semibold text-orange-500">{title}</h3>
              <button
                className="-mt-5 -mr-3 ml-auto bg-transparent border-0 text-white  float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={() => {
                  setModalVisible(false);
                }}
              >
                <label className="bg-transparent text-white  h-6 w-6 text-2xl block outline-none focus:outline-none">
                  ×
                </label>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 -z-10 bg-black"></div>
    </>
  );
}
