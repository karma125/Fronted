import React, { useEffect, useState, useContext } from 'react';
import classes from './WorkPlan.module.css';
import { utils } from '../../general/utils';
import { useForm } from 'react-hook-form';
import { userContext } from '../../general/userContext';
import { getTeachersByKinder } from '../../fetchCalls/userCalls';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AddPlan = () => {
  const [kinderList, setKinderList] = useState(utils.getKinderGardenList());
  const { handleSubmit, register } = useForm();
  const { user } = useContext(userContext);
  const [isRender, setIsRender] = useState(false);

  var minDate = utils.getFormattedDate();

  const calendarApiUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events`;

  useEffect(() => {
    if (user.kindergartenName) {
      setKinderList([user.kindergartenName]);
    }
  }, [user]);

  const onSavePlan = async (data, e) => {
    e.preventDefault();

    const teachers = await getTeachersByKinder({ kindergartenName: data.kindergartenName });
    const teachersEmails = teachers.map(teacher => ({ email: teacher.email }));

    const event = {
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: new Date(data.startDate).toISOString(),
        timeZone: 'Asia/Jerusalem',
      },
      end: {
        dateTime: new Date(data.endDate).toISOString(),
        timeZone: 'Asia/Jerusalem',
      },
      attendees: teachersEmails,
    };

    fetch(calendarApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })
      .then(result => result.json())
      .then(res => {
        setIsRender(prev => !prev);
        toast.success('הפעילות נוספה בהצלחה!');
      })
      .catch(err => {
        console.log(err);
        toast.error('שגיאה בהוספת הפעילות. אנא נסה שוב.');
      });
  };

  return (
    <>
      <ToastContainer  />
      <form className={classes.addPlan} onSubmit={handleSubmit(onSavePlan)}>
        <select {...register('kindergartenName')}>
          {kinderList.map((kinder, index) => (
            <option key={index} value={kinder}>
              {kinder}
            </option>
          ))}
        </select>
        <label>עריכת/יצירת תוכנית עבודה</label>
        <div className={classes.inputsContainer}>
          <div>
            <input {...register('summary')} />
            <label>שם הפעילות</label>
          </div>
          <div>
            <textarea {...register('description')} />
            <label className={classes.alignSelfStart}>תוכן</label>
          </div>
          <div>
            <input
              type='datetime-local'
              min={minDate}
              max='22/05/2025'
              defaultValue={minDate}
              {...register('startDate')}
            />
            <label>תאריך התחלה</label>
          </div>
          <div>
            <input
              type='datetime-local'
              min={minDate}
              max='22/05/2025'
              defaultValue={minDate}
              {...register('endDate')}
            />
            <label>תאריך סיום</label>
          </div>
        </div>

        <label className={classes.alignSelfStart}>הוספת/עריכת פעילות</label>

        <button className={classes.saveBtn}>שמירה</button>
      </form>

      <div>
        <iframe
          key={isRender}
          src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
            user.email
          )}&ctz=Asia%2FJerusalem`}
          height={500}
          width={'100%'}
          style={{ border: 0, frameborder: 0, scrolling: 'no' }}
        ></iframe>
      </div>
    </>
  );
};
