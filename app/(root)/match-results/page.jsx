"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MatchType1,
  MatchType2,
  MatchType3,
  MatchType4,
  MatchType5,
  MatchType6,
  MatchType7,
  MatchType8,
  MatchType9,
  MatchType10,
  MatchType1Img,
  MatchType2Img,
  MatchType3Img,
  MatchType4Img,
  MatchType5Img,
  MatchType6Img,
  MatchType7Img,
  MatchType8Img,
  MatchType9Img,
  MatchType10Img,
} from "@/config";
import { Preferences } from "@capacitor/preferences";
import { showToast } from "@/app/component/application/tostify";
import axios from "axios";

// ✅ helper to get image based on type
const getMatchImage = (matchType) => {
  switch (matchType) {
    case MatchType1:
      return MatchType1Img;
    case MatchType2:
      return MatchType2Img;
    case MatchType3:
      return MatchType3Img;
    case MatchType4:
      return MatchType4Img;
    case MatchType5:
      return MatchType5Img;
    case MatchType6:
      return MatchType6Img;
    case MatchType7:
      return MatchType7Img;
    case MatchType8:
      return MatchType8Img;
    case MatchType9:
      return MatchType9Img;
    case MatchType10:
      return MatchType10Img;
    default:
      return "/images/logo.jpg";
  }
};
const tabs = [
  MatchType1,
  MatchType2,
  MatchType3,
  MatchType4,
  MatchType5,
  MatchType6,
  MatchType7,
  MatchType8,
  MatchType9,
  MatchType10,
];
export default function ResultPage() {
  const router = useRouter();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openMatchId, setOpenMatchId] = useState(null); // ✅ per match toggle
  const [activeTab, setActiveTab] = useState(0);
  const [modal, setModal] = useState(null);
  const scrollRef = useRef(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const toggleMatch = (id) => {
    setOpenMatchId((prev) => (prev === id ? null : id));
  };

  const fetchMatches = async (matchType) => {
    setLoading(true);
    setError(null);

    try {
      const { value } = await Preferences.get({ key: "access_token" });

      if (!value) {
        showToast("error", "Please login to continue!");
        return;
      }

      const res = await axios.get(
        `/api/matchResults?matchType=${matchType || ""}`,
        {
          headers: {
            "x-user-id": value,
          },
        },
      );

      if (!res?.data) {
        showToast("error", res?.data?.message || "Faild to Fetch Matches");
      }
      setMatches(res.data?.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(MatchType1);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    const selected = container?.children[activeTab];
    if (container && selected) {
      const containerWidth = container.offsetWidth;
      const tabLeft = selected.offsetLeft;
      const tabWidth = selected.offsetWidth;
      const scrollLeft = tabLeft - (containerWidth / 2 - tabWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeTab]);

 const deleteMatch = async (id) => {
  setLoading(true);
  setError(null);

  try {
    const { value } = await Preferences.get({ key: "access_token" });

    if (!value) {
      setLoading(false);
      showToast("error", "Please login to continue!");
      return;
    }

    const res = await axios.delete(
      `/api/matchResults/deleteMatch?matchId=${id}`,
      {
        headers: {
          Authorization: `Bearer ${value}`,
        },
      }
    );
    if (!res.data.success) {
      showToast("error", res.data.message || "Failed to delete match");
      return;
    }

  await fetchMatches( tabs[activeTab])
    showToast("success", "Match deleted successfully!");
  } catch (err) {
    setError(err.message || "Something went wrong!");
  } finally {
    setLoading(false);
  }
};

const deleteAll = async (type) => {
  setLoading(true);
  setError(null);

  try {
    const { value } = await Preferences.get({ key: "access_token" });

    if (!value) {
      setLoading(false);
      showToast("error", "Please login to continue!");
      return;
    }

    const res = await axios.delete(
      `/api/matchResults/deleteAll?matchType=${type}`,
      {
        headers: {
          Authorization: `Bearer ${value}`,
        },
      }
    );
    if (!res.data.success) {
      showToast("error", res.data.message || "Failed to delete match");
      return;
    }

  await fetchMatches( tabs[activeTab])
    showToast("success", "Match deleted successfully!");
  } catch (err) {
    setError(err.message || "Something went wrong!");
  } finally {
    setLoading(false);
  }
};

  const handleCardclick = async (id) => {
    router.push(`match-results/details?matchId=${id || ""}`);
  };

  return (
    <div className="space-y-4 bg-black min-h-screen p-4">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-none space-x-2 mt-4 mb-6 no-scrollbar"
      >
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveTab(i);
              fetchMatches(tab);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === i
                ? "bg-yellow-400 text-black scale-105 shadow-lg"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ✅ Loading UI */}
      {loading && (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* ✅ Error UI */}
      {error && (
        <div className="min-h-screen flex items-center justify-center text-red-500">
          {error}
        </div>
      )}

      {/* ✅ No matches */}
      {!loading && !error && matches.length === 0 && (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-800 text-white p-4">
          <h1 className="text-3xl font-bold mb-4 text-center">
            No Matches Found
          </h1>
        </div>
      )}

      {/* ✅ Matches UI */}
      {!loading && !error && matches.length > 0 && (
        <div className="space-y-4 bg-black min-h-screen p-4">
          {/* Tabs */}

          <h1 className="text-center text-2xl text-white font-bold mb-4">
            Played Matches
          </h1>
          <div className="flex justify-between font-bold m-3" >
            <h2 className="text-center text-2xl text-green-400 " > Total Mathes: { matches.length} </h2>
             <button
                        onClick={() =>{setModal("deleteAll")}}
                        className="bg-red-600 p-2 px-4 rounded-lg font-bold text-white"
                      >
                        Delete All
                      </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {matches.map((match) => {
              const sortedPlayers = [...(match.joinedPlayers || [])].sort(
                (a, b) => (a.winning || 0) - (b.winning || 0),
              );

              return (
                <Card
                  key={match._id}
                  className="text-green-300 bg-green-900/20 border border-green-800 hover:bg-green-900/30 transition"
                >
                  <CardHeader>
                    <div className="flex gap-4">
                      <div className="w-16 h-16 min-w-16 rounded-full overflow-hidden relative">
                        <Image
                          src={getMatchImage(match.matchType)}
                          alt={match.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <CardTitle className="flex flex-col justify-center">
                        <strong>{match.title}</strong>
                        <p className="text-sm text-gray-300">
                          {formatDate(match.startTime)}
                        </p>
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex justify-around">
                      <div className="text-green-500 font-bold flex flex-col items-center">
                        <strong>+ WIN PRIZE</strong>
                        <span>{match.winPrize} TK</span>
                      </div>
                      <div className="text-blue-500 font-bold flex flex-col items-center">
                        <strong>+ PER KILL</strong>
                        <span>{match.perKill} TK</span>
                      </div>
                      <div className="text-red-500 font-bold flex flex-col items-center">
                        <strong>ENTRY FEE</strong>
                        <span>{match.entryFee} TK</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-gray-300 mt-2">
                      <div className="flex flex-col items-center w-full">
                        <strong>ENTRY TYPE</strong>
                        <span>{match.entryType}</span>
                      </div>
                      <div className="flex flex-col items-center border-x-4 border-amber-600 w-full">
                        <strong>MAP</strong>
                        <span>{match.map}</span>
                      </div>
                      <div className="flex flex-col items-center w-full">
                        <strong>VERSION</strong>
                        <span>MOBILE</span>
                      </div>
                    </div>
                    <div className="w-full flex justify-between gap-3  ">
                      <button
                        onClick={() => handleCardclick(match._id)}
                        className="bg-blue-600/30 p-2 px-4 rounded-lg font-bold text-white "
                      >
                        Update Result
                      </button>

                      <button
                        onClick={() => { setModal(match._id)}}
                        className="bg-red-500 p-2 px-4 rounded-lg font-bold text-white"
                      >
                        Delete
                      </button>
                      <button
                        className="bg-gray-700 p-2 px-4 rounded-lg font-bold text-white"
                        onClick={() => toggleMatch(match._id)}
                      >
                        {openMatchId === match._id
                          ? "Hide Players"
                          : "Show Players"}
                      </button>
                    </div>

                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        openMatchId === match._id ? "max-h-[500px]" : "max-h-0"
                      }`}
                    >
                      <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm border border-gray-700">
                          <thead>
                            <tr className="bg-gray-800 text-gray-300 text-xs">
                              <th className="p-2 text-left">#</th>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-center">Kills</th>
                              <th className="p-2 text-center">Wins</th>
                            </tr>
                          </thead>

                          <tbody>
                            {sortedPlayers.map((player, index) => (
                              <tr
                                key={player._id || index}
                                className="border-b border-gray-700 hover:bg-gray-800"
                              >
                                <td className="p-2">{index + 1}</td>
                                <td className="p-2 text-green-400">
                                  {player.name || "N/A"}
                                </td>
                                <td className="p-2 text-center">
                                  {player.kills || 0}
                                </td>
                                <td className="p-2 text-center">
                                  {player.winning || 0}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

           {/* Modal */}
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center text-white bg-black/60 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-3">Are You Sure To Delete 
             <strong className="text-red-400"> {modal === "deleteAll" ? `All ${tabs[activeTab]}` : "This"} </strong>  Match ?</h2>

            <p className="text-gray-300 mb-6">This action cannot be undone.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setModal(false)}
                className="w-full bg-gray-700 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => { if(modal==="deleteAll"){
                  deleteAll(tabs[activeTab])
                }else{deleteMatch(modal) }  setModal(false) 
                 }}
                className="w-full py-2 rounded bg-red-700" >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
