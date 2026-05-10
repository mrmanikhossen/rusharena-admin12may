"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { showToast } from "@/app/component/application/tostify";
import ButtonLoading from "@/app/component/buttonLoading";

export default function UpdateNumberPage() {
  const [method, setMethod] = useState("Bkash");
  const [loading, setLoading] = useState(false);
  const [numbers, setNumbers] = useState({ Bkash: "", Nagad: "", Rocket: "" });

  // Schema for admin number update

  const schema = z.object({
    number: z.string().regex(/^01[3-9]\d{8}$/, "Invalid phone number!"),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { number: "" },
  });

  // Fetch current admin numbers
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/updateNumber`);
        if (data.success) {
          setNumbers({
            Bkash: data?.data?.Bkash,
            Nagad: data?.data?.Nagad,
            Rocket: data?.data?.Rocket,
          });
          reset({ number: data?.data?.Bkash });
        }
      } catch {
        showToast("error", "Failed to fetch numbers");
      }
    })();
  }, [reset]);

  // Update number field when method changes
  useEffect(() => {
    reset({ number: numbers[method] || "" });
  }, [method, numbers, reset]);

  // Handle form submit
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { number } = data;
      const res = await axios.post(`/api/updateNumber`, {
        type: method,
        number,
      });

      if (res.data.success) {
        showToast("success", res.data.message);
        setNumbers((prev) => ({ ...prev, [method]: number }));
      } else {
        showToast("error", res.data.message || "Something went wrong!");
      }
    } catch {
      showToast("error", "Failed to update number!");
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { name: "Bkash", img: "/images/assets/bkash.jpg" },
    { name: "Nagad", img: "/images/assets/nagad.jpg" },
    { name: "Rocket", img: "/images/assets/rocket.jpg" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex justify-center items-start p-4 pt-12">
      <div className="bg-gray-900 text-white rounded-2xl shadow-lg w-full mb-6 max-w-md p-6 space-y-6">
        <h2 className="text-lg font-bold text-center">Update Payment Number</h2>

        {/* Payment Method Selector */}
        <div>
          <p className="text-gray-400 mb-2">Select Payment Method</p>
          <div className="flex space-x-4">
            {paymentOptions.map(({ name, img }) => (
              <div
                key={name}
                onClick={() => setMethod(name)}
                className={`flex-1 p-4 rounded-lg cursor-pointer border flex flex-col items-center transition ${
                  method === name
                    ? "border-blue-500 bg-gray-800"
                    : "border-gray-700 bg-gray-900 hover:border-blue-400"
                }`}
              >
                <img
                  src={img}
                  alt={name}
                  className="w-full h-14 object-contain mb-2"
                />
                {method === name && (
                  <span className="text-blue-400 font-bold mt-1">✔</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-gray-400 mb-1">{method} Number</label>
            <input
              type="text"
              placeholder={`Enter ${method} number`}
              {...register("number")}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            {errors.number && (
              <p className="text-red-500 text-sm font-medium mt-1">
                {errors.number.message}
              </p>
            )}
          </div>

          <ButtonLoading
            type="submit"
            loading={loading}
            text={loading ? "Updating..." : "Save"}
            className="w-full py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
          />
        </form>
      </div>
    </div>
  );
}
