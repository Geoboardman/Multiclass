import React, { useState, useEffect } from 'react';
import './App.css';

const SkillsAndPerks = () => {
    const [skills, setSkills] = useState([]);
    const [perks, setPerks] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedPerks, setSelectedPerks] = useState([]);
    const [filterClass, setFilterClass] = useState('all'); // 'all', 'ranger', or 'rogue'
    const [filterType, setFilterType] = useState('both');  // 'both', 'skills', or 'perks'
    const [isDataLoaded, setIsDataLoaded] = useState(false);


    const fetchSkillsAndPerks = () => {
        console.log("fetchSkillsAndPerks")
        return Promise.all([
            fetch('/skills.json').then(response => response.json()),
            fetch('/perks.json').then(response => response.json())
        ]).then(([skillsData, perksData]) => {
            setSkills(skillsData);
            setPerks(perksData);
        }).catch(error => {
            console.error('Error fetching skills and perks:', error);
        });
    };

    const parseQueryParams = () => {
        console.log("parse query params")
        const params = new URLSearchParams(window.location.search);
        const skillsFromURL = params.get('skills')?.split(',').map(decodeURIComponent) || [];
        const perksFromURL = params.get('perks')?.split(',').map(decodeURIComponent) || [];
    
        const selectedSkillsFromURL = skills.filter(skill => skillsFromURL.includes(skill.name));
        const selectedPerksFromURL = perks.filter(perk => perksFromURL.includes(perk.name));
    
        setSelectedSkills(selectedSkillsFromURL);
        setSelectedPerks(selectedPerksFromURL);
    };

    useEffect(() => {
        fetchSkillsAndPerks().then(() => {
            setIsDataLoaded(true); // Set flag after data is fetched
        });
    }, []);
    
    useEffect(() => {
        if (isDataLoaded) {
            parseQueryParams();
        }
    }, [isDataLoaded]); // Add skills and perks as dependencies

    useEffect(() => {
        updateURL(selectedSkills, selectedPerks);
    }, [selectedSkills, selectedPerks]);

    const handleFilterClassChange = (e) => {
        setFilterClass(e.target.value);
    };
    
    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
    };

    const handleSelectSkill = (skill) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else if (selectedSkills.length < 2) {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const handleSelectPerk = (perk) => {
        if (selectedPerks.includes(perk)) {
            setSelectedPerks(selectedPerks.filter(p => p !== perk));
        } else if (selectedPerks.length < 4) {
            setSelectedPerks([...selectedPerks, perk]);
        }
    };

    const isSkillSelected = (skill) => {
        return selectedSkills.some(s => s.name === skill.name);
    };
    
    const isPerkSelected = (perk) => {
        return selectedPerks.some(p => p.name === perk.name);
    }; 
    
    const renderItems = (items, itemType) => {
        return items
            .filter(item => filterClass === 'all' || item.class === filterClass)
            .filter(item => filterType === 'both' || (filterType === 'skills' && item.cooldown) || (filterType === 'perks' && !item.cooldown))
            .map((item, index) => (
                <li key={index} 
                    onClick={() => itemType === 'skills' ? handleSelectSkill(item) : handleSelectPerk(item)}
                    className={itemType === 'skills' ? 'skill-item' : 'perk-item'}>
                    <span className="item-type-badge">{itemType}</span>
                    <strong>{item.name}:</strong> {item.description}
                    {item.cooldown && (
                        <>
                            <br />
                            <i>Cooldown: {item.cooldown}</i>
                        </>
                    )}
                </li>
            ));
    };

    const handleDeselectSkill = (skill) => {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
    };

    const handleDeselectPerk = (perk) => {
        setSelectedPerks(selectedPerks.filter(p => p !== perk));
    };

    const updateURL = (selectedSkills, selectedPerks) => {
        console.log("update url")
        const skillNames = selectedSkills.map(skill => encodeURIComponent(skill.name)).join(',');
        const perkNames = selectedPerks.map(perk => encodeURIComponent(perk.name)).join(',');
    
        const newURL = `${window.location.pathname}?skills=${skillNames}&perks=${perkNames}`;
        window.history.pushState({}, '', newURL);
    };
    

    return (    
        <div className="container">
            <div className="side">
                <h2>Selected Skills ({selectedSkills.length}/2)</h2>
                <ul>
                    {selectedSkills.map((skill, index) => (
                        <li key={index} className="selectedItem" onClick={() => handleDeselectSkill(skill)}>
                            <strong>{skill.name}</strong>: {skill.description}
                            <br />
                            <i>Cooldown: {skill.cooldown}</i>
                        </li>
                    ))}
                </ul>
                <h2>Selected Perks ({selectedPerks.length}/4)</h2>
                <ul>
                    {selectedPerks.map((perk, index) => (
                        <li key={index} className="selectedItem" onClick={() => handleDeselectPerk(perk)}>
                            <strong>{perk.name}</strong>: {perk.description}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="side scrollable">
                {/* Filter controls */}
                <div>
                    <select onChange={handleFilterClassChange}>
                        <option value="all">All Classes</option>
                        <option value="ranger">Ranger</option>
                        <option value="rogue">Rogue</option>
                        <option value="fighter">Fighter</option>  
                        <option value="barbarian">Barbarian</option>    
                        <option value="wizard">Wizard</option>    
                        <option value="cleric">Cleric</option>       
                        <option value="bard">Bard</option>
                        <option value="warlock">Warlock</option>                  
                    </select>
                    <select onChange={handleFilterTypeChange}>
                        <option value="both">Both Skills & Perks</option>
                        <option value="skills">Only Skills</option>
                        <option value="perks">Only Perks</option>
                    </select>
                </div>

                {/* Filtered skills and perks */}
                <h2>All Skills & Perks</h2>
                <ul>{renderItems(skills, 'skills')}</ul>
                <ul>{renderItems(perks, 'perks')}</ul>
            </div>
    </div>
    );
};

export default SkillsAndPerks;
