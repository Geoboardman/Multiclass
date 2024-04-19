import React, { useState, useEffect } from 'react';
import './App.css';
import skillsData from './skills.json';
import perksData from './perks.json';

const SkillsAndPerks = () => {
    const [skills, setSkills] = useState([]);
    const [perks, setPerks] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedPerks, setSelectedPerks] = useState([]);
    const [filterClass, setFilterClass] = useState([]); // Initialize as an empty array
    const [filterType, setFilterType] = useState('both');  // 'both', 'skills', or 'perks'
    const [isDataLoaded, setIsDataLoaded] = useState(false);
     
    useEffect(() => {
        setSkills(skillsData);
        setPerks(perksData);
        setIsDataLoaded(true);
    }, []);


    useEffect(() => {
        parseQueryParams();
    }, [isDataLoaded]); // This will run after the data is loaded


    useEffect(() => {
        if(isDataLoaded)
        {
            updateURL(selectedSkills, selectedPerks);
        }
    }, [selectedSkills, selectedPerks]);

    const parseQueryParams = () => {
        const params = new URLSearchParams(window.location.search);
        const skillsFromURL = params.get('skills')?.split(',').map(decodeURIComponent) || [];
        const perksFromURL = params.get('perks')?.split(',').map(decodeURIComponent) || [];
        const selectedSkillsFromURL = skills.filter(skill => skillsFromURL.includes(skill.name));
        const selectedPerksFromURL = perks.filter(perk => perksFromURL.includes(perk.name));
        setSelectedSkills(selectedSkillsFromURL);
        setSelectedPerks(selectedPerksFromURL);
    };

const handleFilterClassChange = (e) => {
    // Array.from maps the selectedOptions to their values
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFilterClass(selectedOptions);
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

    const Item = ({ item, itemType, onClick, onRemove }) => {
        const isSelected = itemType === 'skills' ? isSkillSelected(item) : isPerkSelected(item);
        const itemClass = isSelected ? `selected-${itemType}-item` : `${itemType}-item`;

        return (
            <li className={itemClass}>
                {/* Render the "X" button only for selected items */}
                {isSelected && (
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); // Prevent the item click handler from firing
                            onRemove(item);
                        }}
                        style={{ float: 'right', cursor: 'pointer' }}>
                        X
                    </button>
                )}
                {/* The rest of the item content */}
                <span onClick={() => onClick(item)} style={{ cursor: 'pointer' }}>
                    <span className={`badge badge-${item.class}`}>{item.class}</span>
                    <strong>{item.name}:</strong> {item.description}
                    {item.cooldown && (
                        <>
                            <br />
                            <i>Cooldown: {item.cooldown}</i>
                        </>
                    )}
                </span>
            </li>
        );
    };
    
    const renderItems = (items, itemType) => {
        // Define the click handler based on the item type
        const handleClick = itemType === 'skills' ? handleSelectSkill : handleSelectPerk;

        // Filter and map over the items, creating an Item component for each
        return items
                .filter(item => filterClass.includes('all') || filterClass.some(cls => item.class === cls))
                .filter(item => filterType === 'both' || (filterType === itemType && item.cooldown) || (filterType === 'perks' && !item.cooldown))
                .map(item => (
                    <Item
                        key={item.name}
                        item={item}
                        itemType={itemType}
                        onClick={handleClick}
                    />
                ));
    };


    const handleDeselectSkill = (skill) => {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
    };

    const handleDeselectPerk = (perk) => {
        setSelectedPerks(selectedPerks.filter(p => p !== perk));
    };

    const updateURL = (selectedSkills, selectedPerks) => {
        const skillNames = selectedSkills.map(skill => encodeURIComponent(skill.name)).join(',');
        const perkNames = selectedPerks.map(perk => encodeURIComponent(perk.name)).join(',');

        const newURL = `${window.location.pathname}?skills=${skillNames}&perks=${perkNames}`;
        window.history.pushState({ selectedSkills, selectedPerks }, '', newURL);
    };
    
    return (    
        <div className="container">
            <div className="side">
                <h2>Selected Skills ({selectedSkills.length}/2)</h2>
                <ul>
                    {selectedSkills.map((skill, index) => (
                        <Item
                            key={index}
                            item={skill}
                            itemType="skills"
                            onClick={() => {}} // No need to handle onClick here if it's only for deselect
                            onRemove={handleDeselectSkill}
                        />
                    ))}
                </ul>
                <h2>Selected Perks ({selectedPerks.length}/4)</h2>
                <ul>
                    {selectedPerks.map((perk, index) => (
                        <Item
                            key={index}
                            item={perk}
                            itemType="perks"
                            onClick={() => {}} // No need to handle onClick here if it's only for deselect
                            onRemove={handleDeselectPerk}
                        />
                    ))}
                </ul>
            </div>
            <div className="side scrollable">
                {/* Filter controls */}
                <div>
                    <select multiple onChange={handleFilterClassChange} value={filterClass}>
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
                <ul>
                    {renderItems(skills, 'skills')}
                    {renderItems(perks, 'perks')}
            </ul>
            </div>
    </div>
    );
};

export default SkillsAndPerks;
