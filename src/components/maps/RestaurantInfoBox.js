import React from "react";
import { compose, withState, lifecycle } from "recompose";
import { Popover, PopoverHeader, PopoverBody } from "reactstrap";
import moment from "moment";
import "moment-precise-range-plugin";

// const testObj = {
//   name: "54th Ave Cafe",
//   isOpenToday: true,
//   isOpenNow: false,
//   todayHours: {
//     close: {
//       day: 1,
//       time: "2300"
//     },
//     open: {
//       day: 1,
//       time: "1100"
//     }
//   },
//   nextDayHours: {
//     close: {
//       day: 2,
//       time: "2300"
//     },
//     open: {
//       day: 2,
//       time: "1100"
//     }
//   },
//   weekDays: [
//     "Monday: 11:00 AM – 11:00 PM",
//     "Tuesday: 11:00 AM – 11:00 PM",
//     "Wednesday: 11:00 AM – 11:00 PM",
//     "Thursday: 11:00 AM – 11:00 PM",
//     "Friday: 11:00 AM – 11:00 PM",
//     "Saturday: 11:00 AM – 11:00 PM",
//     "Sunday: 11:00 AM – 11:00 PM"
//   ]
// };

const timeHelper = ({
  notAvailable,
  immortal,
  isOpenToday,
  isOpenNow,
  todayHours
}) => {
  if (notAvailable) return notAvailable;
  if (immortal) return "Open 24 hours";
  let closeTime, openTime;
  if (isOpenToday) {
    if (isOpenNow) {
      const { time } = todayHours.close;
      const closeHours = time.slice(0, 2) + ":" + time.slice(2);
      closeTime = moment().format(`YYYY-MM-DD ${closeHours}:00`);
      // return { closeTime };
    } else {
      // if
      const { time } = todayHours.open;
      const openhours = time.slice(0, 2) + ":" + time.slice(2);
      openTime = moment().format(`YYYY-MM-DD ${openhours}:00`);
      // return { openTime };
    }
  }
  return { openTime, closeTime };
};

const currentTime = () => moment().format("YYYY-MM-DD HH:mm:ss");

const calcRemainTime = ({ openTime = false, closeTime }) => {
  // console.log(openTime);
  return openTime
    ? moment(currentTime()).preciseDiff(openTime)
    : moment(currentTime()).preciseDiff(closeTime);
};

let timerID;
const enhence = compose(
  withState("remainingTime", "setRemainingTime", ""),
  withState("rotateDeg", "setRotateDeg", 45),
  lifecycle({
    componentDidMount() {
      const { schedule, setRemainingTime } = this.props;
      const businessHours = timeHelper(schedule);
      if (typeof businessHours === "string")
        return setRemainingTime(businessHours);
      else {
        console.log("schedule => ", schedule);
        calcRemainTime(timeHelper(schedule));
        const time = timeHelper(schedule);
        setRemainingTime(calcRemainTime(time));
        timerID = setInterval(
          () => setRemainingTime(calcRemainTime(time)),
          1000
        );
      }
    },
    componentWillUnmount() {
      clearInterval(timerID);
    }
  })
);
const RestaurantInfoBox = enhence(
  ({ placeId, name, schedule, remainingTime, popover }) => {
    const { chosenId, isOpen } = popover;
    if (chosenId === placeId && isOpen) {
      return (
        <div className="RestaurantInfoBox">
          {
            <Popover
              placement="auto"
              isOpen={isOpen}
              target={`Popover-${placeId}`}
            >
              <PopoverHeader>{name}</PopoverHeader>
              <PopoverBody>{schedule.name}</PopoverBody>
              <span>{remainingTime}</span>
            </Popover>
          }
        </div>
      );
    } else {
      // btnTrun(`#Popover-${chosenId}`);
      // console.log("btnTurn");
      return <div className="RestaurantInfoBox" />;
    }
  }
);

export default RestaurantInfoBox;
