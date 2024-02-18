import React, { useContext, useState } from 'react';
import classes from './SearchContent.module.css';
import { useForm } from 'react-hook-form';
import { utils } from '../../../general/utils';
import { useEffect } from 'react';
import { getContent } from '../../../fetchCalls/contentCalls';
import { ContentPreview } from '../../../cmps/ContentPreview/ContentPreview';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../../../general/userContext';

export const SearchContent = () => {
	const { handleSubmit, register } = useForm();
	const [content, setContent] = useState([]);
	const [filteredContent, setFilteredContent] = useState([]);

	const navigate = useNavigate()
	useEffect(() => {
		const fetchContent = async () => {
			let content = await getContent();
			setContent(content);
			setFilteredContent(content);
		};

		fetchContent();
	}, []);

	const onSearch = (data, e) => {
		e.preventDefault();

		var newList = [];
		content.forEach(c => {
			if (
				new RegExp(data.contentName, 'g').test(c.contentName) &&
				(data.contentKind === 'הכל' || c.contentKind === data.contentKind) &&
				(data.contentTag === 'הכל' || c.contentTag === data.contentTag)
			) {
				newList.push(c);
			}
		});

		setFilteredContent(newList);
	};

	return (
		<div className={classes.searchContent}>
			<form onSubmit={handleSubmit(onSearch)}>
				<h1>חיפוש תכנים</h1>

				<div className={classes.formBody}>
					<h3> ניתן לבצע חיפוש של תוכן באמצעות הדרכים הבאות:</h3>
					<div className={classes.EditBtn}><button onClick={() => { navigate('/home/add-feedback') }}>עריכה</button></div>
					<div className={classes.formItem}>
						<label>שם תוכן</label>
						<input {...register('contentName')} />
					</div>

					<div className={classes.formItem}>
						<label>תגית</label>
						<select {...register('contentTag')}>
							<option key={-1}>הכל</option>
							{utils.contentKinds().map((kind, index) => {
								return <option key={index}>{kind}</option>;
							})}
						</select>
					</div>
					<div className={classes.formItem}>
						<label>סוג תוכן</label>
						<select {...register('contentKind')}>
							<option>הכל</option>
							<option>תמונה</option>
							<option>סירטון</option>
							<option>מסמך</option>
						</select>
					</div>
					<button className={classes.searchBtn}>חיפוש</button>
				</div>
			</form>
			{!filteredContent.length ? (
				<p className={classes.txtNotFound}>לא נמצאו תוצאות</p>
			) : (
				<ContentPreview files={filteredContent} />
			)}
		</div>
	);
};
